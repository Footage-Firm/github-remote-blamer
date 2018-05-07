'use strict';

const GithubGraphQLApi = require('node-github-graphql');
const Promise = require('bluebird');
const _ = require('lodash');

const config = require('../config');

class GithubRemoteBlamer {
    constructor() {
        this.github = new GithubGraphQLApi({
            Promise,
            token: config.githubApiToken,
            debug: config.debug
        });
    }

    //See: https://pl;form.github.community/t/how-can-i-query-for-blame-blameranges/1017/10
    async blame(organization, repository, oid, path, lines) {

        const isSingleLine = !_.isArray(lines);

        if (isSingleLine) {
            lines = [lines];
        } else {
            lines.sort();
        }

        const query = _buildGitHubGraphQLQuery(organization, repository, oid, path);

        const response =  await this.github.query(query);
        const blameRanges = _.get(response, 'data.organization.repository.object.blame.ranges');

        if (!blameRanges) {
            throw new Error(`No information for ${organization}/${repository} ${path} version ${oid}`);
        }

        const blameInfoArray = _blameInfoForLines(lines, blameRanges);
        return isSingleLine ? _.first(blameInfoArray) : blameInfoArray;

    }
}

function _blameInfoForLines(lines, blameRanges) {

    const result = [];
    let lineIndex = 0;

    blameRanges.forEach(range => {

        let applicableToLineNumber = true;

        while (applicableToLineNumber) {
            let line = lines[lineIndex];
            applicableToLineNumber = line >= range.startingLine && line <= range.endingLine;

            if (applicableToLineNumber) {
                result[lineIndex] = _.merge({line}, _blameInfo(range));
                lineIndex += 1;
            }
        }
    });

    if (lineIndex < lines.length) {
        throw new Error(`No information for line ${lines[lineIndex]}`);
    }

    return result;
}

function _blameInfo(blameRange) {

    return {
        oid: blameRange.commit.oid,
        date: new Date(blameRange.commit.author.date),
        name: blameRange.commit.author.name,
        email: blameRange.commit.author.email
    };
}

function _buildGitHubGraphQLQuery(organization, repository, oid, path) {
    return `
query {
  organization(login: "${organization}") {
    name
    url
    repository(name: "${repository}") {
      name
      object(expression: "${oid}") {
        ... on Commit {
          blame(path: "${path}") {
            ranges {
              startingLine
              endingLine
              age
              commit {
                oid
                author {
                  name
                  email
                  date
                }
              }
            }
          }
        }
      }
    }
  }
}
`;
}

module.exports = GithubRemoteBlamer;