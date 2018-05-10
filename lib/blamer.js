'use strict';

const GithubGraphQLApi = require('node-github-graphql');
const _ = require('lodash');

class GithubRemoteBlamer {

    /**
     * Constructs a GithubRemoteBlamer to git blame using the GitHub API
     * @param apiToken {string}
     * @param [options] {{debug: boolean}} options for the GithubRemoteBlamer
     */
    constructor(apiToken, options) {

        const token = apiToken;
        const debug = _.get(options, 'debug') === true;

        if (!token) {
            throw new Error('GitHub API Token is required for GithubRemoteBlamer');
        }

        this.github = new GithubGraphQLApi({token, debug});
    }

    /**
     * Uses the GitHub GraphQL API to blame certain lines within a file
     * @param organization {string} GitHub organization containing the repository
     * @param repository {string} GitHub repository containing the file
     * @param oid {string} git object id of the repository pertaining to the version of the file to be used
     * @param path {string} path to the file to be blamed within the repository
     * @param lines {number | number[]} the line in the file to be blamed, or a set of lines
     * @returns {Promise<{oid: string, date: Date, name: string, email: string}>|Promise<{oid: string, date: Date, name: string, email: string}[]>}
     *          blame information for the line (or an array of blame informatio if multiple lines provided)
     */
    async blame(organization, repository, oid, path, lines) {

        const isSingleLine = !_.isArray(lines); //keep track if caller expects a single result, or an array

        lines = _.castArray(lines).sort();

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

/**
 * Parses GitHub GraphQL API response of blame ranges, to return a simpler condensed form relevant for the given lines
 * @param lines {number[]} the lines to be git blamed (order doesn't matter)
 * @param blameRanges {object[]} applicable GitHub GraphQL BlameRanges (see: https://developer.github.com/v4/reference/object/blamerange/)
 * @returns {{oid: string, date: Date, name: string, email: string}[]}
 * @private
 */
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

/**
 * Simplifies a GitHub GraphQL BlameRange object into a condensed and flattened object with information we care about
 * @param blameRange {object} GitHub GraphQL BlameRange to simplify
 * @returns {{oid: string, date: Date, name: string, email: string}}
 * @private
 */
function _blameInfo(blameRange) {

    return {
        oid: blameRange.commit.oid,
        date: new Date(blameRange.commit.author.date),
        name: blameRange.commit.author.name,
        email: blameRange.commit.author.email
    };
}

/**
 * Constructs the GraphQL query for GitHub's api to get a BlameRange
 * @param organization {string} GitHub organization containing the repository
 * @param repository {string} GitHub repository containing the file
 * @param oid {string} git object id of the repository pertaining to the version of the file to be used
 * @param path {string} path to the file to be blamed within the repository
 * @returns {string} the GitHub API GraphQL query
 * @private
 */
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