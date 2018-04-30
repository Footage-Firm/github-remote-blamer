'use strict';

require('dotenv').config();

const _ = require('lodash');
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
                expect(info).to.be.an('object');
                expect(info.line).to.equal(7);
                expect(info.oid).to.equal('8eb95ae57973b2cbe7778bc2e10450a380ca2efe');
                expect(info.date).to.be.sameMoment('2017-03-05T18:44:22.000Z');
                expect(info.name).to.equal('chainhelen');
                expect(info.email).to.equal('chainhelen@gmail.com');
                done();
            });

    }).timeout(5000);

    it('should work with multiple lines', done => {

        blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js', [23,24,26])
            .then(info => {

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

                done();
            });

    }).timeout(5000);

    it('should throw an error for invalid path', done => {
        blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'does/not/exist.js', 3)
            .then(info => {
                throw new Error('No error thrown');
            }).catch(err => {
            expect(_.lowerCase(err.message)).to.contain('no information');
            done();
        });
    }).timeout(5000);

    it('should throw an error for invalid line number', done => {
        blamer.blame('expressjs', 'express', '40e04ec7a6d365a7e083b0fdf7f9d2c7afc036a0', 'examples/auth/index.js', 1234567)
            .then(info => {
                throw new Error('No error thrown');
            }).catch(err => {
            expect(_.lowerCase(err.message)).to.contain('line');
            done();
        });
    }).timeout(5000);

});
