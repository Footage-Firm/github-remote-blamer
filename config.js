'use strict';
const config = {
    debug: process.env.GITHUB_BLAME_REMOTE_DEBUG === 'true',
    githubApiToken: process.env.GITHUB_API_TOKEN //Needs read access for user, repo, and org
};

module.exports = config;