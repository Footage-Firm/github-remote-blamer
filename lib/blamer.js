'use strict';

const GithubGraphQLApi = require('node-github-graphql');
const Promise = require('bluebird');
const config = require('../config');

class GithubRemoteBlamer {
    constructor() {
        this.github = new GithubGraphQLApi({
            Promise,
            token: config.githubApiToken,
            debug: true
        });
    }

    //See: https://pl;form.github.community/t/how-can-i-query-for-blame-blameranges/1017/10
    //TODO: array of line numbers to blame
    blame(organization, repository, sha, path) {

        const query = `
query {
  organization(login: "${organization}") {
    name
    url
    repository(name: "${repository}") {
      name
      object(expression: "${sha}") {
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
        return this.github.query(query)
            .then(response => {
                console.log('GOT RESPONSE:', JSON.stringify(response, undefined, 2));
            });

    }
}

module.exports = GithubRemoteBlamer;