'use strict';

require('dotenv').config();

const _ = require('lodash');
const chai = require('chai');
const chaiMoment = require('chai-moment');

chai.use(chaiMoment);
const expect = require('chai').expect;

const GithubRemoteBlamer = require('../lib/blamer');

const debug = process.env.GITHUB_BLAME_REMOTE_DEBUG === 'true';
const token = process.env.GITHUB_API_TOKEN;

const blamer = new GithubRemoteBlamer(token, {debug});

describe('blame()', () => {

    it('should work with a single line', async () => {

        const info = await blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js', 7);
        expect(info).to.be.an('object');
        expect(info.line).to.equal(7);
        expect(info.oid).to.equal('8eb95ae57973b2cbe7778bc2e10450a380ca2efe');
        expect(info.date).to.be.sameMoment('2017-03-05T18:44:22.000Z');
        expect(info.name).to.equal('chainhelen');
        expect(info.email).to.equal('chainhelen@gmail.com');

    });

    it('should work with multiple lines, regardless of order', async () => {

        const info = await blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js', [26,24,23]);

        expect(info).to.be.an('array');
        expect(info).to.have.length(3);

        const infoLine23 = info[0];
        const infoLine24 = info[1];
        const infoLine26 = info[2];

        expect(infoLine23).to.be.an('object');
        expect(infoLine23.line).to.equal(23);
        expect(infoLine23.oid).to.equal('ca306eace1befc9d290cd5f79be8e6ba7c01b917');
        expect(infoLine23.date).to.be.sameMoment('2014-07-03T14:49:53.000Z');
        expect(infoLine23.name).to.equal('Douglas Christopher Wilson');
        expect(infoLine23.email).to.equal('doug@somethingdoug.com');

        expect(infoLine24).to.be.an('object');
        expect(infoLine24.line).to.equal(24);
        expect(infoLine24.oid).to.equal('ca306eace1befc9d290cd5f79be8e6ba7c01b917');
        expect(infoLine24.date).to.be.sameMoment('2014-07-03T14:49:53.000Z');
        expect(infoLine24.name).to.equal('Douglas Christopher Wilson');
        expect(infoLine24.email).to.equal('doug@somethingdoug.com');

        expect(infoLine26).to.be.an('object');
        expect(infoLine26.line).to.equal(26);
        expect(infoLine26.oid).to.equal('0f24f715bad686beb591d194888ee0a45253f0f3');
        expect(infoLine26.date).to.be.sameMoment('2012-02-18T21:16:17.000Z');
        expect(infoLine26.name).to.equal('TJ Holowaychuk');
        expect(infoLine26.email).to.equal('tj@vision-media.ca');
    });

    it('should throw an error for invalid path', async () => {
        let caughtErr = null;
        try {
            await blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'does/not/exist.js', 3);
        } catch(err) {
            caughtErr = err;
        }
        expect(caughtErr).to.be.an('Error');
        expect(_.lowerCase(caughtErr.message)).to.contain('no information');
    });

    it('should throw an error for invalid line number', async () => {
        let caughtErr = null;
        try {
            await blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js', 1234567);
        } catch(err) {
            caughtErr = err;
        }
        expect(caughtErr).to.be.an('Error');
        expect(_.lowerCase(caughtErr.message)).to.contain('line');
    });

});
