import chai from 'chai';
const expect = chai.expect;

import {
  UOARNumber, NumberTypes, getValueAt, getValue, toValue, getSign, removeSign,
  isValidNumber, isValidSign, isValidUOARNumber, toUOARNumber, trimSign, trimNumber,
  standardizeUOARNumber, getSignMultiplierForNumber, wholeToLength, fractionToLength,
  toLength, addZeroesAfter, addZeroesBefore, equalizeLength
} from '../../src/uoar1/uoar_core.mjs';

describe('UOAR Core', function() {

  describe('UOARNumber', function() {

    it('toSigned', function() {
      let number = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      expect(number.toSigned()).to.equal("-10.50");
    });

    it('toSigned no fraction', function() {
      let number = new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED);
      expect(number.toSigned()).to.equal("-10");
    });

    it('toSigned with spaces', function() {
      let number = new UOARNumber(" - ", " 10 ", " 50 ", 10, NumberTypes.SIGNED);
      expect(number.toSigned()).to.equal("-10.50");
    });

    it('toUnsigned', function() {
      let number = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      expect(number.toUnsigned()).to.equal("10.50");
    });

    it('toUnsigned no fraction', function() {
      let number = new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED);
      expect(number.toUnsigned()).to.equal("10");
    });

    it('toUnsigned with spaces', function() {
      let number = new UOARNumber(" - ", " 10 ", " 50 ", 10, NumberTypes.SIGNED);
      expect(number.toUnsigned()).to.equal("10.50");
    });

    it('toWhole', function() {
      let number = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      expect(number.toWhole()).to.equal("-1050");
    });

    it('toWhole no fraction', function() {
      let number = new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED);
      expect(number.toWhole()).to.equal("-10");
    });

    it('toWhole with spaces', function() {
      let number = new UOARNumber(" - ", " 10 ", " 50 ", 10, NumberTypes.SIGNED);
      expect(number.toWhole()).to.equal("-1050");
    });

    it('copy', function() {
      let number = new UOARNumber("-", "10", "50", 8, NumberTypes.SIGNED);
      expect(number.copy()).to.deep.equal(number);
    });

    it('toString', function() {
      let number = new UOARNumber("-", "10", "50", 8, NumberTypes.SIGNED);
      expect(number.toString()).to.equal("-10.50 (8)");
    });

    it('toString no fraction', function() {
      let number = new UOARNumber("-", "10", "", 8, NumberTypes.SIGNED);
      expect(number.toString()).to.equal("-10 (8)");
    });

    it('toString with spaces', function() {
      let number = new UOARNumber(" - ", " 10 ", " 50 ", 8, NumberTypes.SIGNED);
      expect(number.toString()).to.equal("-10.50 (8)");
    });

  });

  describe('getValueAt', function() {

    it('minimum numeric', function() {
      expect(getValueAt("19AZ", 0)).to.equal(1);
    });

    it('maximum numeric', function() {
      expect(getValueAt("19AZ", 1)).to.equal(9);
    });

    it('minimum alphabetic', function() {
      expect(getValueAt("19AZ", 2)).to.equal(10);
    });

    it('maximum alphabetic', function() {
      expect(getValueAt("19AZ", 3)).to.equal(35);
    });

    it('invalid index', function() {
      expect(getValueAt("19AZ", 4, false)).to.be.null;
    });

    it('invalid character', function() {
      expect(getValueAt("-", 0, false)).to.be.null;
    });

  });

  describe('getValue', function() {

    it('numberic', function() {
      expect(getValue("64", false)).to.equal(6);
    });

    it('alphabetic', function() {
      expect(getValue("FA", false)).to.equal(15);
    });

  });

  describe('toValue', function() {

    it('minimum value', function() {
      expect(toValue(0, false)).to.equal('0');
    });

    it('maximum value', function() {
      expect(toValue(35, false)).to.equal('Z');
    });

    it('below minimum value', function() {
      expect(toValue(-1, false)).to.be.null;
    });

    it('above maximum value', function() {
      expect(toValue(36, false)).to.be.null;
    });
  
  });

  describe('getSign', function() {

    it('unsigned', function() {
      expect(getSign("10.50", 10, NumberTypes.UNSIGNED, false)).to.equal("");
    });

    it('signed', function() {
      expect(getSign("+--10.50", 10, NumberTypes.SIGNED, false)).to.equal("+--");
    });

    it('signed implicit', function() {
      expect(getSign("10.50", 10, NumberTypes.SIGNED, false)).to.equal("+");
    });

    it('SMR', function() {
      expect(getSign("00010.50", 10, NumberTypes.SMR, false)).to.equal("0");
    });

    it('OC/TC', function() {
      expect(getSign("00010.50", 10, NumberTypes.OC, false)).to.equal("000");
      expect(getSign("00010.50", 10, NumberTypes.TC, false)).to.equal("000");
    });

    it('SMR non base 10', function() {
      expect(getSign("8810.50", 9, NumberTypes.SMR, false)).to.equal("8");
    });

    it('OC/TC non base 10', function() {
      expect(getSign("8810.50", 9, NumberTypes.OC, false)).to.equal("88");
      expect(getSign("8810.50", 9, NumberTypes.TC, false)).to.equal("88");
    });

    it('SMR/OC/TC implicit', function() {
      expect(getSign("10.50", 10, NumberTypes.SMR, false)).to.equal("0");
      expect(getSign("10.50", 10, NumberTypes.OC, false)).to.equal("0");
      expect(getSign("10.50", 10, NumberTypes.TC, false)).to.equal("0");
    });

    it('spaces', function() {
      expect(getSign(" +-- 10. 50", 10, NumberTypes.SIGNED, false)).to.equal("+--");
    });

  });

  describe('removeSign', function() {

    it('unsigned', function() {
      expect(removeSign("10.50", 10, NumberTypes.UNSIGNED, false)).to.equal("10.50");
    });

    it('signed', function() {
      expect(removeSign("+--10.50", 10, NumberTypes.SIGNED, false)).to.equal("10.50");
    });

    it('SMR', function() {
      expect(removeSign("00010.50", 10, NumberTypes.SMR, false)).to.equal("0010.50");
    });

    it('OC/TC', function() {
      expect(removeSign("00010.50", 10, NumberTypes.OC, false)).to.equal("10.50");
      expect(removeSign("00010.50", 10, NumberTypes.TC, false)).to.equal("10.50");
    });

    it('implicit whole', function() {
      expect(removeSign("+--", 10, NumberTypes.SIGNED, false)).to.equal("0");
    });

  });

  describe('isValidSign', function() {

    it('unsigned valid', function() {
      expect(isValidSign("", 10, NumberTypes.UNSIGNED, false)).to.be.true;
    });

    it('unsigned invalid', function() {
      expect(isValidSign("+", 10, NumberTypes.UNSIGNED, false)).to.be.false;
    });

    it('signed valid', function() {
      expect(isValidSign("+--+", 10, NumberTypes.SIGNED, false)).to.be.true;
    });

    it('unsigned invalid', function() {
      expect(isValidSign("+--+1", 10, NumberTypes.SIGNED, false)).to.be.false;
    });

    it('SMR valid', function() {
      expect(isValidSign("8", 9, NumberTypes.SMR, false)).to.be.true;
    });

    it('SMR invalid', function() {
      expect(isValidSign("88", 9, NumberTypes.SMR, false)).to.be.false;
    });

    it('OC/TC valid', function() {
      expect(isValidSign("999", 10, NumberTypes.OC, false)).to.be.true;
      expect(isValidSign("999", 10, NumberTypes.TC, false)).to.be.true;
    });

    it('OC/TC invalid', function() {
      expect(isValidSign("990", 10, NumberTypes.OC, false)).to.be.false;
      expect(isValidSign("990", 10, NumberTypes.TC, false)).to.be.false;
    });

  });

  describe('getSignMultiplier', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "50", 10, NumberTypes.UNSIGNED);
      expect(getSignMultiplierForNumber(number, true)).to.equal(1);
    });

    it('signed standardized positive', function() {
      let number = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      expect(getSignMultiplierForNumber(number, true)).to.equal(1);
    });

    it('signed standardized negative', function() {
      let number = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      expect(getSignMultiplierForNumber(number, true)).to.equal(-1);
    });

    it('signed not standardized', function() {
      let number = new UOARNumber(" +---+", "10", "5", 10, NumberTypes.SIGNED);
      expect(getSignMultiplierForNumber(number, false)).to.equal(-1);
    });

    it('signed invalid sign', function() {
      let number = new UOARNumber(" +-.-+", "10", "5", 10, NumberTypes.SIGNED);
      expect(getSignMultiplierForNumber(number, false)).to.equal(0);
    });

    it('SMR', function() {
      let number = new UOARNumber("0", "10", "5", 10, NumberTypes.SMR);
      expect(getSignMultiplierForNumber(number, true)).to.equal(1);
    });

    it('OC/TC standardized positive', function() {
      let number_oc = new UOARNumber("0", "10", "5", 10, NumberTypes.OC);
      expect(getSignMultiplierForNumber(number_oc, true)).to.equal(1);
      let number_tc = new UOARNumber("0", "10", "5", 10, NumberTypes.TC);
      expect(getSignMultiplierForNumber(number_tc, true)).to.equal(1);
    });

    it('OC/TC standardized negative', function() {
      let number_oc = new UOARNumber("9", "10", "5", 10, NumberTypes.OC);
      expect(getSignMultiplierForNumber(number_oc, true)).to.equal(-1);
      let number_tc = new UOARNumber("9", "10", "5", 10, NumberTypes.TC);
      expect(getSignMultiplierForNumber(number_tc, true)).to.equal(-1);
    });

    it('OC/TC not standardized', function() {
      let number_oc = new UOARNumber(" 99", "10", "5", 10, NumberTypes.OC);
      expect(getSignMultiplierForNumber(number_oc, false)).to.equal(-1);
      let number_tc = new UOARNumber(" 99", "10", "5", 10, NumberTypes.TC);
      expect(getSignMultiplierForNumber(number_tc, false)).to.equal(-1);
    });

    it('OC/TC invalid sign', function() {
      let number_oc = new UOARNumber("099", "10", "5", 10, NumberTypes.OC);
      expect(getSignMultiplierForNumber(number_oc, false)).to.equal(0);
      let number_tc = new UOARNumber("099", "10", "5", 10, NumberTypes.TC);
      expect(getSignMultiplierForNumber(number_tc, false)).to.equal(0);
    });

  });

  describe('isValidUOARNumber', function() {

    it('valid', function() {
      let number = new UOARNumber("99", "10", "50", 10, NumberTypes.TC);
      expect(isValidUOARNumber(number)).to.be.true;
    });

    it('above base digit whole', function() {
      let number = new UOARNumber("FF", "AG", "50", 16, NumberTypes.TC);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('above base digit fraction', function() {
      let number = new UOARNumber("FF", "A", "G0", 16, NumberTypes.TC);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('invalid character digit whole', function() {
      let number = new UOARNumber("FF", "A-", "50", 16, NumberTypes.TC);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('invalid character digit fraction', function() {
      let number = new UOARNumber("FF", "A", "5-0", 16, NumberTypes.TC);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('spaces', function() {
      let number = new UOARNumber(" FF ", " AG ", " 50 ", 16, NumberTypes.TC);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('null value', function() {
      expect(isValidUOARNumber(null)).to.be.false;
    });

    it('invalid base', function() {
      let number = new UOARNumber("+", "10", "50", 50, NumberTypes.SIGNED);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('invalid sign', function() {
      let number = new UOARNumber("1", "10", "50", 50, NumberTypes.SMR);
      expect(isValidUOARNumber(number)).to.be.false;
    });

    it('immutability', function() {
      let number = new UOARNumber("99", "10", "50", 10, NumberTypes.TC);
      let number_copy = number.copy();
      isValidUOARNumber(number);
      expect(number).to.deep.equal(number_copy);
    });

  });

  describe('isValidNumber', function() {

    it('null value', function() {
      expect(isValidNumber(null)).to.be.false;
    });

    it('invalid base', function() {
      expect(isValidNumber("+10.50", 50, NumberTypes.SIGNED)).to.be.false;
    });

    it('valid', function() {
      expect(isValidNumber("910.50", 10, NumberTypes.SMR)).to.be.true;
    });

    it('without fraction', function() {
      expect(isValidNumber("910", 10, NumberTypes.SMR)).to.be.true;
    });

    it('empty fraction', function() {
      expect(isValidNumber("910.", 10, NumberTypes.SMR)).to.be.true;
    });

    it('multiple radix points', function() {
      expect(isValidNumber("910.50.0", 10, NumberTypes.SMR)).to.be.false;
    });

    it('spaces', function() {
      expect(isValidNumber("91 0.5 0", 10, NumberTypes.SMR)).to.be.true;
    });

    it('digit above base', function() {
      expect(isValidNumber("910.5A", 10, NumberTypes.SMR)).to.be.false;
    });

    it('invalid character', function() {
      expect(isValidNumber("91-.50", 10, NumberTypes.SMR)).to.be.false;
    });

  });

  describe('toUOARNumber', function() {

    it('valid', function() {
      expect(toUOARNumber("+10.50", 10, NumberTypes.SIGNED, false)).to.deep.equal(new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED));
    });

    it('null value', function() {
      expect(toUOARNumber(null, 10, NumberTypes.SIGNED, false)).to.be.null;
    });

    it('invalid base', function() {
      expect(toUOARNumber("+10.50", 50, NumberTypes.SIGNED, false)).to.be.null;
    });

    it('invalid number', function() {
      expect(toUOARNumber("+1A.50", 10, NumberTypes.SIGNED, false)).to.be.null;
    });

  });

  describe('trimSign', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "50", 50, NumberTypes.UNSIGNED);
      expect(trimSign(number)).to.deep.equal(number);
    });

    it('signed', function() {
      let number = new UOARNumber("+---+", "10", "50", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      expect(trimSign(number)).to.deep.equal(res);
    });

    it('SMR', function() {
      let number_smr = new UOARNumber("9", "10", "50", 10, NumberTypes.SMR);
      let res_smr = new UOARNumber("9", "10", "50", 10, NumberTypes.SMR);
      expect(trimSign(number_smr)).to.deep.equal(res_smr);
    });

    it('OC/TC', function() {
      let number_oc = new UOARNumber("999", "10", "50", 10, NumberTypes.OC);
      let res_oc = new UOARNumber("9", "10", "50", 10, NumberTypes.OC);
      expect(trimSign(number_oc)).to.deep.equal(res_oc);
      let number_tc = new UOARNumber("999", "10", "50", 10, NumberTypes.TC);
      let res_tc = new UOARNumber("9", "10", "50", 10, NumberTypes.TC);
      expect(trimSign(number_tc)).to.deep.equal(res_tc);
    });

  });

  describe('trimNumber', function() {

    it('unsigned/signed/SMR', function() {
      let number_unsigned = new UOARNumber("", "0010", "50", 10, NumberTypes.UNSIGNED);
      let res_unsigned = new UOARNumber("", "10", "5", 10, NumberTypes.UNSIGNED);
      expect(trimNumber(number_unsigned)).to.deep.equal(res_unsigned);
      let number_signed = new UOARNumber("++", "0010", "50", 10, NumberTypes.SIGNED);
      let res_signed = new UOARNumber("++", "10", "5", 10, NumberTypes.SIGNED);
      expect(trimNumber(number_signed)).to.deep.equal(res_signed);
      let number_smr = new UOARNumber("0", "0010", "50", 10, NumberTypes.SMR);
      let res_smr = new UOARNumber("0", "10", "5", 10, NumberTypes.SMR);
      expect(trimNumber(number_smr)).to.deep.equal(res_smr);
    });

    it('OC/TC', function() {
      let number_oc = new UOARNumber("00", "0010", "50", 10, NumberTypes.OC);
      let res_oc = new UOARNumber("00", "10", "5", 10, NumberTypes.OC);
      expect(trimNumber(number_oc)).to.deep.equal(res_oc);
      let number_tc = new UOARNumber("00", "0010", "50", 10, NumberTypes.TC);
      let res_tc = new UOARNumber("00", "10", "5", 10, NumberTypes.TC);
      expect(trimNumber(number_tc)).to.deep.equal(res_tc);
    });

    it('spaces', function() {
      let number = new UOARNumber(" - ", " 10 ", " 5 ", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      expect(trimNumber(number)).to.deep.equal(res);
    });

    it('zero fraction', function() {
      let number = new UOARNumber("-", "10", "0", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED);
      expect(trimNumber(number)).to.deep.equal(res);
    });

  });

  describe('standardizeUOARNumber', function() {

    it('null value', function() {
      expect(standardizeUOARNumber(null, false)).to.be.null;
    });

    it('unsigned', function() {
      let number = new UOARNumber("", "0010", "50", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "10", "5", 10, NumberTypes.UNSIGNED);
      expect(standardizeUOARNumber(number, false)).to.deep.equal(res);
    });

    it('signed', function() {
      let number = new UOARNumber("+---+", "0010", "50", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      expect(standardizeUOARNumber(number, false)).to.deep.equal(res);
    });

    it('SMR', function() {
      let number = new UOARNumber("9", "010", "50", 10, NumberTypes.SMR);
      let res = new UOARNumber("9", "10", "5", 10, NumberTypes.SMR);
      expect(standardizeUOARNumber(number, false)).to.deep.equal(res);
    });

    it('OC/TC', function() {
      let number_oc = new UOARNumber("99", "9910", "50", 10, NumberTypes.OC);
      let res_oc = new UOARNumber("9", "10", "5", 10, NumberTypes.OC);
      expect(standardizeUOARNumber(number_oc, false)).to.deep.equal(res_oc);
      let number_tc = new UOARNumber("99", "9910", "50", 10, NumberTypes.TC);
      let res_tc = new UOARNumber("9", "10", "5", 10, NumberTypes.TC);
      expect(standardizeUOARNumber(number_tc, false)).to.deep.equal(res_tc);
    });

    it('invalid base', function() {
      let number = new UOARNumber("+--+", "0010", "50", 50, NumberTypes.SIGNED);
      expect(standardizeUOARNumber(number, false)).to.be.null;
    });

    it('invalid number', function() {
      let number = new UOARNumber("+--+", "00A0", "50", 10, NumberTypes.SIGNED);
      expect(standardizeUOARNumber(number, false)).to.be.null;
    });

    it('spaces', function() {
      let number = new UOARNumber(" +- -+ ", " 00 10 ", " 5 0 ", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      expect(standardizeUOARNumber(number, false)).to.deep.equal(res);
    });

  });

  describe('wholeToLength', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "50", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "00010", "50", 10, NumberTypes.UNSIGNED);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "00010", "50", 10, NumberTypes.SIGNED);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "00010", "50", 10, NumberTypes.SIGNED);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "10", "50", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "00010", "50", 10, NumberTypes.SMR);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("1", "10", "50", 10, NumberTypes.SMR);
      let res = new UOARNumber("1", "00010", "50", 10, NumberTypes.SMR);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "10", "50", 10, NumberTypes.OC);
      let res = new UOARNumber("0", "00010", "50", 10, NumberTypes.OC);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("1", "10", "50", 10, NumberTypes.OC);
      let res = new UOARNumber("1", "11110", "50", 10, NumberTypes.OC);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "10", "50", 10, NumberTypes.TC);
      let res = new UOARNumber("0", "00010", "50", 10, NumberTypes.TC);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("1", "10", "50", 10, NumberTypes.TC);
      let res = new UOARNumber("1", "11110", "50", 10, NumberTypes.TC);
      expect(wholeToLength(number, 5, false)).to.deep.equal(res);
    });

    it('null value', function() {
      expect(wholeToLength(null, 5, false)).to.be.null;
    });

    it('too large', function() {
      let number = new UOARNumber("+", "1000", "50", 10, NumberTypes.SIGNED);
      expect(wholeToLength(number, 3, false)).to.be.null;
    });

  });

  describe('fractionToLength', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "5", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "10", "500", 10, NumberTypes.UNSIGNED);
      expect(fractionToLength(number, 3, false)).to.deep.equal(res);
    });

    it('signed', function() {
      let number = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "10", "500", 10, NumberTypes.SIGNED);
      expect(fractionToLength(number, 3, false)).to.deep.equal(res);
    });

    it('SMR', function() {
      let number = new UOARNumber("1", "10", "5", 10, NumberTypes.SMR);
      let res = new UOARNumber("1", "10", "500", 10, NumberTypes.SMR);
      expect(fractionToLength(number, 3, false)).to.deep.equal(res);
    });

    it('OC', function() {
      let number = new UOARNumber("1", "10", "5", 10, NumberTypes.OC);
      let res = new UOARNumber("1", "10", "500", 10, NumberTypes.OC);
      expect(fractionToLength(number, 3, false)).to.deep.equal(res);
    });

    it('TC', function() {
      let number = new UOARNumber("1", "10", "5", 10, NumberTypes.TC);
      let res = new UOARNumber("1", "10", "500", 10, NumberTypes.TC);
      expect(fractionToLength(number, 3, false)).to.deep.equal(res);
    });

    it('null value', function() {
      expect(fractionToLength(null, 3, false)).to.be.null;
    });

    it('trim fraction', function() {
      let number = new UOARNumber("+", "10", "55555", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "555", 10, NumberTypes.SIGNED);
      expect(fractionToLength(number, 3, false)).to.deep.equal(res);
    });

  });

  describe('toLength', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "5", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "010", "500", 10, NumberTypes.UNSIGNED);
      expect(toLength(number, 6, 3, false)).to.deep.equal(res);
    });

    it('signed', function() {
      let number = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "010", "500", 10, NumberTypes.SIGNED);
      expect(toLength(number, 6, 3, false)).to.deep.equal(res);
    });

    it('SMR', function() {
      let number = new UOARNumber("1", "10", "5", 10, NumberTypes.SMR);
      let res = new UOARNumber("1", "010", "500", 10, NumberTypes.SMR);
      expect(toLength(number, 6, 3, false)).to.deep.equal(res);
    });

    it('OC', function() {
      let number = new UOARNumber("1", "10", "5", 10, NumberTypes.OC);
      let res = new UOARNumber("1", "110", "500", 10, NumberTypes.OC);
      expect(toLength(number, 6, 3, false)).to.deep.equal(res);
    });

    it('TC', function() {
      let number = new UOARNumber("1", "10", "5", 10, NumberTypes.TC);
      let res = new UOARNumber("1", "110", "500", 10, NumberTypes.TC);
      expect(toLength(number, 6, 3, false)).to.deep.equal(res);
    });

    it('null value', function() {
      expect(toLength(null, 6, 3, false)).to.be.null;
    });

    it('invalid length', function() {
      let number = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      expect(toLength(number, 3, 3, false)).to.be.null;
    });

  });

  describe('addZeroesAfter', function() {

    it('without radix', function() {
      expect(addZeroesAfter("+--+10", 10, NumberTypes.SIGNED, 5, false)).to.equal("+--+10000");
    });

    it('with radix', function() {
      expect(addZeroesAfter("+--+10.5", 10, NumberTypes.SIGNED, 5, false)).to.equal("+--+10.500");
    });

    it('null value', function() {
      expect(addZeroesAfter(null, 10, NumberTypes.SIGNED, 5, false)).to.be.null;
    });

    it('spaces', function() {
      expect(addZeroesAfter(" +--+ 1 0.5 ", 10, NumberTypes.SIGNED, 5, false)).to.equal("+--+10.500");
    });

  });

  describe('addZeroesBefore', function() {

    it('without radix', function() {
      expect(addZeroesBefore("+--+10", 10, NumberTypes.SIGNED, 5, false)).to.equal("+--+00010");
    });

    it('with radix', function() {
      expect(addZeroesBefore("+--+10.5", 10, NumberTypes.SIGNED, 5, false)).to.equal("+--+0010.5");
    });

    it('null value', function() {
      expect(addZeroesBefore(null, 10, NumberTypes.SIGNED, 5, false)).to.be.null;
    });

    it('spaces', function() {
      expect(addZeroesBefore(" +--+ 1 0.5 ", 10, NumberTypes.SIGNED, 5, false)).to.equal("+--+0010.5");
    });

  });

  describe('equalizeLength', function() {

    it('null value', function() {
      let number1 = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      let number2 = null;
      expect(equalizeLength(number1, number2, true, false)).to.be.false;
      expect(number1).to.deep.equal(number1);
      expect(number2).to.be.null;
    });

    it('first larger whole', function() {
      let number1 = new UOARNumber("+", "2000", "", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED);
      let res1 = new UOARNumber("+", "2000", "", 10, NumberTypes.SIGNED);
      let res2 = new UOARNumber("-", "0010", "", 10, NumberTypes.SIGNED);
      expect(equalizeLength(number1, number2, true, false)).to.be.true;
      expect(number1).to.deep.equal(res1);
      expect(number2).to.deep.equal(res2);
    });

    it('first larger fraction', function() {
      let number1 = new UOARNumber("+", "10", "500", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-", "10", "2", 10, NumberTypes.SIGNED);
      let res1 = new UOARNumber("+", "10", "500", 10, NumberTypes.SIGNED);
      let res2 = new UOARNumber("-", "10", "200", 10, NumberTypes.SIGNED);
      expect(equalizeLength(number1, number2, true, false)).to.be.true;
      expect(number1).to.deep.equal(res1);
      expect(number2).to.deep.equal(res2);
    });

    it('second larger whole', function() {
      let number1 = new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "2000", "", 10, NumberTypes.SIGNED);
      let res1 = new UOARNumber("-", "0010", "", 10, NumberTypes.SIGNED);
      let res2 = new UOARNumber("+", "2000", "", 10, NumberTypes.SIGNED);
      expect(equalizeLength(number1, number2, true, false)).to.be.true;
      expect(number1).to.deep.equal(res1);
      expect(number2).to.deep.equal(res2);
    });

    it('second larger fraction', function() {
      let number1 = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-", "10", "200", 10, NumberTypes.SIGNED);
      let res1 = new UOARNumber("+", "10", "500", 10, NumberTypes.SIGNED);
      let res2 = new UOARNumber("-", "10", "200", 10, NumberTypes.SIGNED);
      expect(equalizeLength(number1, number2, true, false)).to.be.true;
      expect(number1).to.deep.equal(res1);
      expect(number2).to.deep.equal(res2);
    });

    it('incompatible number types', function() {
      let number1 = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-", "10", "200", 10, NumberTypes.SMR);
      expect(equalizeLength(number1, number2, true, false)).to.be.false;
      expect(number1).to.deep.equal(number1);
      expect(number2).to.deep.equal(number2);
    });

    it('not standardized', function() {
      let number1 = new UOARNumber("++", "02000", "", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-+", "010", "", 10, NumberTypes.SIGNED);
      let res1 = new UOARNumber("+", "2000", "", 10, NumberTypes.SIGNED);
      let res2 = new UOARNumber("-", "0010", "", 10, NumberTypes.SIGNED);
      expect(equalizeLength(number1, number2, false, false)).to.be.true;
      expect(number1).to.deep.equal(res1);
      expect(number2).to.deep.equal(res2);
    });

  });

});