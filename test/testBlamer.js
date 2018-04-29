'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiMoment = require('chai-moment');

chai.use(chaiMoment);
const expect = require('chai').expect;


const GithubRemoteBlamer = require('../lib/blamer');

const blamer = new GithubRemoteBlamer();

describe('blame()', () => {
    it('should work with a single line', done => {

        blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js', 7)
            .then(info => {
                expect(info.oid).to.equal('8eb95ae57973b2cbe7778bc2e10450a380ca2efe');
                expect(info.date).to.be.sameMoment('2017-03-05T18:44:22.000Z');
                expect(info.name).to.equal('chainhelen');
                expect(info.email).to.equal('chainhelen@gmail.com');
                done();
            });

    }).timeout(5000);
});
