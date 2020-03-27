import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../../src/uoar1/uoar_core.mjs';
import { 
  UOARNumberToDecimalInteger, baseToDecimalInteger, toDecimal, fromDecimal, convertBases,
  digitToBinary, numberToBinary, binaryToNumber, decimalTo8421, decimalFrom8421
} from '../../src/uoar1/base_converter.mjs';

describe('Base Converter', function() {

  describe('UOARNumberToDecimalInteger', function() {

    it('null value', function() {
      expect(UOARNumberToDecimalInteger(null, false, false)).to.be.null;
    });

    it('invalid number', function() {
      let number = new UOARNumber("+", "A0", "5", 10, NumberTypes.SIGNED);
      expect(UOARNumberToDecimalInteger(number, false, false)).to.be.null;
    });

    it('positive number', function() {
      let number = new UOARNumber("0", "8AF", "4D", 16, NumberTypes.TC);
      let res = 2223;
      expect(UOARNumberToDecimalInteger(number, false, false)).to.equal(res);
    });

    it('negative number', function() {
      let number = new UOARNumber("F", "8AF", "4D", 16, NumberTypes.TC);
      let res = -1872;
      expect(UOARNumberToDecimalInteger(number, false, false)).to.equal(res);
    });

    it('mutability', function() {
      let number = new UOARNumber("", "25", "6", 10, NumberTypes.UNSIGNED);
      let number_copy = number.copy();
      let res = 25;
      expect(UOARNumberToDecimalInteger(number, false, false)).to.equal(res);
      expect(number).to.deep.equal(number_copy);
    });

  });

  describe('baseToDecimalInteger', function() {

    it('without fraction', function() {
      expect(baseToDecimalInteger("+-8AF", 16, NumberTypes.SIGNED, false)).to.equal(-2223);
    });

    it('with fraction', function() {
      expect(baseToDecimalInteger("+-8AF.4D", 16, NumberTypes.SIGNED, false)).to.equal(-2223);
    });

  });

  describe('toDecimal', function() {

    it('null value', function() {
      expect(toDecimal(null, false, false)).to.be.null;
    });

    it('invalid number', function() {
      let number = new UOARNumber("0", "8AG", "4D", 16, NumberTypes.TC);
      expect(toDecimal(number, false, false)).to.be.null;
    });

    it('not standardized', function() {
      let number = new UOARNumber("", "008AF", "80", 16, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "2223", "5", 10, NumberTypes.UNSIGNED);
      expect(toDecimal(number, false, false)).to.deep.equal(res);
    });

    it('base 10', function() {
      let number = new UOARNumber("+", "90", "5", 10, NumberTypes.SIGNED);
      expect(toDecimal(number, true, false)).to.deep.equal(number);
    });

    it('unsigned', function() {
      let number = new UOARNumber("", "8AF", "8", 16, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "2223", "5", 10, NumberTypes.UNSIGNED);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "8AF", "8", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "2223", "5", 10, NumberTypes.SIGNED);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "8AF", "8", 16, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "2223", "5", 10, NumberTypes.SIGNED);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "8AF", "8", 16, NumberTypes.SMR);
      let res = new UOARNumber("0", "2223", "5", 10, NumberTypes.SMR);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("F", "8AF", "8", 16, NumberTypes.SMR);
      let res = new UOARNumber("9", "2223", "5", 10, NumberTypes.SMR);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "8AF", "8", 16, NumberTypes.OC);
      let res = new UOARNumber("0", "2223", "5", 10, NumberTypes.OC);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("F", "8AF", "7", 16, NumberTypes.OC);
      let res = new UOARNumber("9", "8127", "49999999", 10, NumberTypes.OC);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "8AF", "8", 16, NumberTypes.TC);
      let res = new UOARNumber("0", "2223", "5", 10, NumberTypes.TC);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("F", "8AF", "8", 16, NumberTypes.TC);
      let res = new UOARNumber("9", "8127", "5", 10, NumberTypes.TC);
      expect(toDecimal(number, true, false)).to.deep.equal(res);
    });

  });

  describe('fromDecimal', function() {

    it('null value', function() {
      expect(fromDecimal(null, 16, false, false)).to.be.null;
    });

    it('invalid number', function() {
      let number = new UOARNumber("0", "A7", "125", 10, NumberTypes.TC);
      expect(fromDecimal(number, 16, false, false)).to.be.null;
    });

    it('not standardized', function() {
      let number = new UOARNumber("", "00107", "1250", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "6B", "2", 16, NumberTypes.UNSIGNED);
      expect(fromDecimal(number, res.base, false, false)).to.deep.equal(res);
    });

    it('non base 10', function() {
      let number = new UOARNumber("+", "8AF", "8", 16, NumberTypes.SIGNED);
      expect(fromDecimal(number, 4, true, false)).to.be.null;
    });

    it('invalid base', function() {
      let number = new UOARNumber("+", "8AF", "8", 16, NumberTypes.SIGNED);
      expect(fromDecimal(number, 0, true, false)).to.be.null;
    });

    it('unsigned', function() {
      let number = new UOARNumber("", "107", "125", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "6B", "2", 16, NumberTypes.UNSIGNED);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "107", "125", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "6B", "2", 16, NumberTypes.SIGNED);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "107", "125", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "6B", "2", 16, NumberTypes.SIGNED);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "107", "125", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "6B", "2", 16, NumberTypes.SMR);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("9", "107", "125", 10, NumberTypes.SMR);
      let res = new UOARNumber("F", "6B", "2", 16, NumberTypes.SMR);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "107", "125", 10, NumberTypes.OC);
      let res = new UOARNumber("0", "6B", "2", 16, NumberTypes.OC);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("9", "107", "124", 10, NumberTypes.OC);
      let res = new UOARNumber("F", "C83", "1", 16, NumberTypes.OC);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "107", "125", 10, NumberTypes.TC);
      let res = new UOARNumber("0", "6B", "2", 16, NumberTypes.TC);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("9", "107", "125", 10, NumberTypes.TC);
      let res = new UOARNumber("F", "C83", "2", 16, NumberTypes.TC);
      expect(fromDecimal(number, res.base, true, false)).to.deep.equal(res);
    });

  });

  describe('convertBases', function() {

    it('null value', function() {
      expect(convertBases(null, 16, false, false)).to.be.null;
    });

    it('invalid number', function() {
      let number = new UOARNumber("0", "A7", "125", 10, NumberTypes.TC);
      expect(convertBases(number, 16, false, false)).to.be.null;
    });

    it('not standardized', function() {
      let number = new UOARNumber("", "004257", "2320", 8, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "8AF", "4D", 16, NumberTypes.UNSIGNED);
      expect(convertBases(number, res.base, false, false)).to.deep.equal(res);
    });

    it('invalid base', function() {
      let number = new UOARNumber("+", "4257", "232", 8, NumberTypes.SIGNED);
      expect(convertBases(number, 0, true, false)).to.be.null;
    });

    it('positive number', function() {
      let number = new UOARNumber("0", "4257", "232", 8, NumberTypes.TC);
      let res = new UOARNumber("0", "8AF", "4D", 16, NumberTypes.TC);
      expect(convertBases(number, res.base, true, false)).to.deep.equal(res);
    });

    it('negative number', function() {
      let number = new UOARNumber("7", "4257", "232", 8, NumberTypes.TC);
      let res = new UOARNumber("F", "8AF", "4D", 16, NumberTypes.TC);
      expect(convertBases(number, res.base, true, false)).to.deep.equal(res);
    });

  });

  describe('digitToBinary', function() {

    it('invalid index', function() {
      expect(digitToBinary("1AF", -1, false)).to.be.null;
      expect(digitToBinary("1AF", 3, false)).to.be.null;
    });

    it('invalid value', function() {
      expect(digitToBinary("1-F", 1, false)).to.be.null;
    });

    it('valid value', function() {
      expect(digitToBinary("1AF", 1, false)).to.equal("1010");
    });

  });

  describe('numberToBinary', function() {

    it('negative number', function() {
      expect(numberToBinary(-736, false)).to.be.null;
    });

    it('valid number', function() {
      expect(numberToBinary(736, false)).to.equal("1011100000");
    });

  });

  describe('binaryToNumber', function() {

    it('invalid number', function() {
      expect(binaryToNumber("1011120000", false)).to.be.null;
    });

    it('valid number', function() {
      expect(binaryToNumber("1011100000", false)).to.equal(736);
    });

    it('spaces', function() {
      expect(binaryToNumber("10 11 10 00 00", false)).to.equal(736);
    });

  });

  describe('decimalTo8421', function() {

    it('invalid number', function() {
      expect(decimalTo8421("47G3", false)).to.be.null;
    });

    it('valid number', function() {
      expect(decimalTo8421("4713", false)).to.equal("0100011100010011");
    });

    it('spaces', function() {
      expect(decimalTo8421("47 13", false)).to.equal("0100011100010011");
    });

  });

  describe('decimalFrom8421', function() {

    it('invalid number', function() {
      expect(decimalFrom8421("0102011100010011", false)).to.be.null;
    });

    it('valid number', function() {
      expect(decimalFrom8421("0100011100010011", false)).to.equal("4713");
    });

    it('spaces', function() {
      expect(decimalFrom8421("0100 0111 0001 0011", false)).to.equal("4713");
    });

  });

});