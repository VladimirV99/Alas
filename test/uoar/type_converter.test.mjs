import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../../src/uoar1/uoar_core.mjs';
import { 
  convertToType, convertToUnsigned, convertToSigned, convertToSMR, convertToOC, convertToTC
} from '../../src/uoar1/type_converter.mjs';

describe('Type Converter', function() {

  describe('convertToUnsigned', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(number);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("", "3B", "E", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("", "3B", "F", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, true, false)).to.deep.equal(res);
    });

    it('invalid number', function() {
      let number = new UOARNumber("", "G4", "1", 16, NumberTypes.UNSIGNED);
      expect(convertToUnsigned(number, false, false)).to.be.null;
    });

  });

  describe('convertToSigned', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      let res = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(number);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(number);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("-", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("-", "3B", "E", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("-", "3B", "F", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, true, false)).to.deep.equal(res);
    });

    it('invalid number', function() {
      let number = new UOARNumber("+", "G4", "1", 16, NumberTypes.SIGNED);
      expect(convertToSigned(number, false, false)).to.be.null;
    });

  });

  describe('convertToSMR', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(number);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(number);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("F", "3B", "E", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("F", "3B", "F", 16, NumberTypes.SMR);
      expect(convertToSMR(number, true, false)).to.deep.equal(res);
    });

    it('invalid number', function() {
      let number = new UOARNumber("0", "G4", "1", 16, NumberTypes.SMR);
      expect(convertToSMR(number, false, false)).to.be.null;
    });

  });

  describe('convertToOC', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("F", "3B", "E", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("F", "3B", "E", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(number);
    });

    it('OC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(number);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("F", "C4", "0", 16, NumberTypes.OC);
      expect(convertToOC(number, true, false)).to.deep.equal(res);
    });

    it('invalid number', function() {
      let number = new UOARNumber("0", "G4", "1", 16, NumberTypes.OC);
      expect(convertToOC(number, false, false)).to.be.null;
    });

  });

  describe('convertToTC', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "C4", "1", 16, NumberTypes.UNSIGNED);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "C4", "1", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("F", "3B", "F", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("F", "3B", "F", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.OC);
      let res = new UOARNumber("F", "C4", "2", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "C4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(number);
    });

    it('TC negative', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, true, false)).to.deep.equal(number);
    });

    it('invalid number', function() {
      let number = new UOARNumber("0", "G4", "1", 16, NumberTypes.TC);
      expect(convertToTC(number, false, false)).to.be.null;
    });

  });

  describe('convertToType', function() {

    it('to unsigned', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("", "3B", "F", 16, NumberTypes.UNSIGNED);
      expect(convertToType(number, NumberTypes.UNSIGNED, true, false)).to.deep.equal(res);
    });

    it('to signed', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("-", "3B", "F", 16, NumberTypes.SIGNED);
      expect(convertToType(number, NumberTypes.SIGNED, true, false)).to.deep.equal(res);
    });

    it('to SMR', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.TC);
      let res = new UOARNumber("F", "3B", "F", 16, NumberTypes.SMR);
      expect(convertToType(number, NumberTypes.SMR, true, false)).to.deep.equal(res);
    });

    it('to OC', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("F", "3B", "E", 16, NumberTypes.OC);
      expect(convertToType(number, NumberTypes.OC, true, false)).to.deep.equal(res);
    });

    it('to TC', function() {
      let number = new UOARNumber("F", "C4", "1", 16, NumberTypes.SMR);
      let res = new UOARNumber("F", "3B", "F", 16, NumberTypes.TC);
      expect(convertToType(number, NumberTypes.TC, true, false)).to.deep.equal(res);
    });

  });

});