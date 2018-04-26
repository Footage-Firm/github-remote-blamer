'use strict';

const expect = require('chai').expect;

const GithubRemoteBlamer = require('../lib/blamer');

const blamer = new GithubRemoteBlamer();

describe('blame()', () => {
    it('should work', () => {

        blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js');

    });
});
