import chai from 'chai';
const expect = chai.expect;

import { encodeCRC, decodeCRC, encodeHammingSEC, decodeHammingSEC } from '../../../src/uoar1/error_correction/error_correction.mjs';

describe('Error Correction', function() {

  describe('encodeCRC', function() {

    it('empty input', function() {
      expect(encodeCRC("", "", false)).to.be.null;
    });

    it('invalid input', function() {
      let message = "110201001110";
      let generator = "11001";
      expect(encodeCRC(message, generator, false)).to.be.null;
    });

    it('invalid generator', function() {
      let message = "110101001110";
      let generator = "00000";
      expect(encodeCRC(message, generator, false)).to.be.null;
    });

    it('example 1', function() {
      let message = "110101001110";
      let generator = "11001";
      let res = "1101010011100111";
      expect(encodeCRC(message, generator, false)).to.equal(res);
    });

    it('example 2', function() {
      let message = "101101011001";
      let generator = "11001";
      let res = "1011010110011110";
      expect(encodeCRC(message, generator, false)).to.equal(res);
    });

  });

  describe('decodeCRC', function() {

    it('empty input', function() {
      expect(decodeCRC("", "", false)).to.be.null;
    });

    it('invalid input', function() {
      let message = "1110020110010111";
      let generator = "10111";
      expect(decodeCRC(message, generator, false)).to.be.null;
    });

    it('invalid generator', function() {
      let message = "1110010110010111";
      let generator = "00000";
      expect(decodeCRC(message, generator, false)).to.be.null;
    });

    it('example 1', function() {
      let message = "1110010110010111";
      let generator = "10111";
      expect(decodeCRC(message, generator, false)).to.be.false;
    });

    it('example 2', function() {
      let message = "1101010011100111";
      let generator = "11001";
      expect(decodeCRC(message, generator, false)).to.be.true;
    });

  });

  describe('encodeHammingSEC', function() {

    it('empty input', function() {
      expect(encodeHammingSEC("", false)).to.be.null;
    });

    it('invalid message length', function() {
      let message = "110001010";
      expect(encodeHammingSEC(message, false)).to.be.null;
    });

    it('invalid input', function() {
      let message = "11020101";
      expect(encodeHammingSEC(message, false)).to.be.null;
    });

    it('example 1', function() {
      let message = "10111011";
      let res = "101110111110";
      expect(encodeHammingSEC(message, false)).to.equal(res);
    });

    it('example 2', function() {
      let message = "11111011";
      let res = "111110110101";
      expect(encodeHammingSEC(message, false)).to.equal(res);
    });

  });

  describe('decodeHammingSEC', function() {

    it('empty input', function() {
      expect(decodeHammingSEC("", false)).to.be.null;
    });

    it('invalid message length', function() {
      let message = "1100010101100";
      expect(decodeHammingSEC(message, false)).to.be.null;
    });

    it('invalid input', function() {
      let message = "110201010110";
      expect(decodeHammingSEC(message, false)).to.be.null;
    });

    it('example 1', function() {
      let message = "111010110100";
      let res = "111010111100";
      expect(decodeHammingSEC(message, false)).to.equal(res);
    });

    it('example 2', function() {
      let message = "101110110101";
      let res = "111110110101";
      expect(decodeHammingSEC(message, false)).to.equal(res);
    });

  });

});