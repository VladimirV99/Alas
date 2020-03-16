import chai from 'chai';
const expect = chai.expect;

import { isInBounds, isValidBase, createConstantString, createZeroString } from '../../src/uoar1/util.mjs';

describe('Util', function() {

  describe('isInBounds', function() {

    it('in bounds', function() {
      expect(isInBounds(10, 0, 20)).to.be.true;
    });

    it('below lower bound', function() {
      expect(isInBounds(-1, 0, 20)).to.be.false;
    });

    it('above upper bound', function() {
      expect(isInBounds(21, 0, 20)).to.be.false;
    });

    it('invalid bounds', function() {
      expect(isInBounds(10, 20, 0)).to.be.false;
    });

  });

  describe('isValidBase', function() {

    it('minimum base', function() {
      expect(isValidBase(2)).to.be.true;
    });

    it('maximum base', function() {
      expect(isValidBase(35)).to.be.true;
    });

    it('below minimum base', function() {
      expect(isValidBase(1)).to.be.false;
    });

    it('above maximum base', function() {
      expect(isValidBase(36)).to.be.false;
    });

  });

  describe('createConstantString', function() {

    it('repeat alphabetic', function() {
      expect(createConstantString('a', 3)).to.equal('aaa');
    });

    it('repeat numeric', function() {
      expect(createConstantString('1', 4)).to.equal('1111');
    });

    it('invalid repeat character', function() {
      expect(createConstantString('ab', 3)).to.be.null;
    });

    it('negative length', function() {
      expect(createConstantString('a', -1)).to.be.null;
    });

  });

  describe('createZeroString', function() {

    it('valid', function() {
      expect(createZeroString(3)).to.equal('000');
    });

    it('negative length', function() {
      expect(createZeroString(-1)).to.be.null;
    });

  });

});