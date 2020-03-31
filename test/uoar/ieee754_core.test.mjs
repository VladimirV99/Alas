import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../../src/uoar1/uoar_core.mjs';
import {
  IEEE754Number, IEEE754Formats, SignificandExponentPair, BINARY32, BINARY64, DECIMAL32, HEXADECIMAL32, POS_ZERO, NEG_ZERO, POS_INF, NEG_INF, QNAN, SNAN,
  convertToIEEE754Binary32, convertToIEEE754Binary64, convertToIEEE754Decimal32DPD,
  convertToIEEE754Decimal32BID, convertToIEEE754Hexadecimal32,
  normalizeBinary, normalizeDecimal, normalizeHexadecimal, decimalToDPD, DPDtoDecimal, isValidIEEE754, toIEEE754Number,
  getSpecialValueBinary32, getSpecialValueBinary64, getSpecialValueDecimal32,
  convertFromIEEE754Binary32, convertFromIEEE754Binary64, convertFromIEEE754Decimal32DPD, convertFromIEEE754Decimal32BID, convertFromIEEE754Hexadecimal32
} from '../../src/uoar1/ieee754_core.mjs';

describe('IEEE754 Core', function() {

  describe('convertToIEEE754Binary32', function() {

    it('not signed significand', function() {
      let significand = new UOARNumber("", "50", "", 10, NumberTypes.UNSIGNED);
      let exponent = "10";
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.be.null;
    });

    it('not standardized significand', function() {
      let significand = new UOARNumber("--++", "0019", "12500", 10, NumberTypes.SIGNED);
      let exponent = "7";
      let res = new IEEE754Number("0", "10001010", "00110010000000000000000", IEEE754Formats.BINARY32);
      expect(convertToIEEE754Binary32(significand, exponent, false, false)).to.deep.equal(res);
    });

    it('invalid significand', function() {
      let significand = new UOARNumber("+", "1A", "125", 10, NumberTypes.SIGNED);
      let exponent = "7";
      expect(convertToIEEE754Binary32(significand, exponent, false, false)).to.be.null;
    });

    it('positive infinity', function() {
      let significand = new UOARNumber("+", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "10";
      let res = new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('negative infinity', function() {
      let significand = new UOARNumber("-", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "10";
      let res = new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 1', function() {
      let significand = new UOARNumber("+", "19", "125", 10, NumberTypes.SIGNED);
      let exponent = "7";
      let res = new IEEE754Number("0", "10001010", "00110010000000000000000", IEEE754Formats.BINARY32);
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let significand = new UOARNumber("-", "71", "75", 10, NumberTypes.SIGNED);
      let exponent = "-13";
      let res = new IEEE754Number("1", "01111000", "00011111000000000000000", IEEE754Formats.BINARY32);
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('invalid exponent', function() {
      let significand = new UOARNumber("-", "71", "75", 10, NumberTypes.SIGNED);
      let exponent = "A";
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.be.null;
    });

    it('exponent below lower bound', function() {
      let significand = new UOARNumber("+", "1", "5", 10, NumberTypes.SIGNED);
      let exponent = (BINARY32.MIN_EXPONENT-1).toString();
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.be.null;
    });

    it('exponent above upper bound', function() {
      let significand = new UOARNumber("+", "1", "5", 10, NumberTypes.SIGNED);
      let exponent = (BINARY32.MAX_EXPONENT+1).toString();
      expect(convertToIEEE754Binary32(significand, exponent, true, false)).to.be.null;
    });

  });

  describe('convertToIEEE754Binary64', function() {

    it('not signed significand', function() {
      let significand = new UOARNumber("", "50", "", 10, NumberTypes.UNSIGNED);
      let exponent = "10";
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.be.null;
    });

    it('not standardized significand', function() {
      let significand = new UOARNumber("--+-", "00199", "62500", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "10000000110", "1000111101000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(convertToIEEE754Binary64(significand, exponent, false, false)).to.deep.equal(res);
    });

    it('invalid significand', function() {
      let significand = new UOARNumber("+", "1A9", "625", 10, NumberTypes.SIGNED);
      let exponent = "0";
      expect(convertToIEEE754Binary64(significand, exponent, false, false)).to.be.null;
    });

    it('positive infinity', function() {
      let significand = new UOARNumber("+", "5000000000000000", "", 10, NumberTypes.SIGNED);
      let exponent = "10";
      let res = new IEEE754Number("0", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('negative infinity', function() {
      let significand = new UOARNumber("-", "5000000000000000", "", 10, NumberTypes.SIGNED);
      let exponent = "10";
      let res = new IEEE754Number("1", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 1', function() {
      let significand = new UOARNumber("-", "199", "625", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "10000000110", "1000111101000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let significand = new UOARNumber("-", "1780", "53125", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "10000001001", "1011110100100010000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('invalid exponent', function() {
      let significand = new UOARNumber("-", "199", "625", 10, NumberTypes.SIGNED);
      let exponent = "A";
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.be.null;
    });

    it('exponent below lower bound', function() {
      let significand = new UOARNumber("+", "1", "5", 10, NumberTypes.SIGNED);
      let exponent = (BINARY64.MIN_EXPONENT-1).toString();
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.be.null;
    });

    it('exponent above upper bound', function() {
      let significand = new UOARNumber("+", "1", "5", 10, NumberTypes.SIGNED);
      let exponent = (BINARY64.MAX_EXPONENT+1).toString();
      expect(convertToIEEE754Binary64(significand, exponent, true, false)).to.be.null;
    });

  });

  describe('convertToIEEE754Decimal32DPD', function() {

    it('not signed significand', function() {
      let significand = new UOARNumber("", "246", "8957", 10, NumberTypes.UNSIGNED);
      let exponent = "0";
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.be.null;
    });

    it('not standardized significand', function() {
      let significand = new UOARNumber("--+-", "00246", "895700", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
      expect(convertToIEEE754Decimal32DPD(significand, exponent, false, false)).to.deep.equal(res);
    });

    it('invalid significand', function() {
      let significand = new UOARNumber("-", "2A6", "8957", 10, NumberTypes.SIGNED);
      let exponent = "0";
      expect(convertToIEEE754Decimal32DPD(significand, exponent, false, false)).to.be.null;
    });

    it('positive infinity', function() {
      let significand = new UOARNumber("+", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("0", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('negative infinity', function() {
      let significand = new UOARNumber("-", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 1', function() {
      let significand = new UOARNumber("-", "246", "8957", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let significand = new UOARNumber("-", "8645", "193822", 10, NumberTypes.SIGNED);
      let exponent = "-1";
      let res = new IEEE754Number("1", "11010100001", "11010001010011011010", IEEE754Formats.DECIMAL32DPD);
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 3', function() {
      let significand = new UOARNumber("+", "0", "9173598", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("0", "11011011110", "00111100111011011110", IEEE754Formats.DECIMAL32DPD);
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('invalid exponent', function() {
      let significand = new UOARNumber("-", "246", "8957", 10, NumberTypes.SIGNED);
      let exponent = "A";
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.be.null;
    });

    it('exponent below lower bound', function() {
      let significand = new UOARNumber("+", "1", "", 10, NumberTypes.SIGNED);
      let exponent = (DECIMAL32.MIN_EXPONENT-1).toString();
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.be.null;
    });

    it('exponent above upper bound', function() {
      let significand = new UOARNumber("+", "1", "", 10, NumberTypes.SIGNED);
      let exponent = (DECIMAL32.MAX_EXPONENT+1).toString();
      expect(convertToIEEE754Decimal32DPD(significand, exponent, true, false)).to.be.null;
    });

  });

  describe('convertToIEEE754Decimal32BID', function() {

    it('not signed significand', function() {
      let significand = new UOARNumber("", "14", "37", 10, NumberTypes.UNSIGNED);
      let exponent = "-15";
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.be.null;
    });

    it('not standardized significand', function() {
      let significand = new UOARNumber("--+-", "0014", "3700", 10, NumberTypes.SIGNED);
      let exponent = "-15";
      let res = new IEEE754Number("1", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
      expect(convertToIEEE754Decimal32BID(significand, exponent, false, false)).to.deep.equal(res);
    });

    it('invalid significand', function() {
      let significand = new UOARNumber("-", "1A", "37", 10, NumberTypes.SIGNED);
      let exponent = "-15";
      expect(convertToIEEE754Decimal32BID(significand, exponent, false, false)).to.be.null;
    });

    it('positive infinity', function() {
      let significand = new UOARNumber("+", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("0", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('negative infinity', function() {
      let significand = new UOARNumber("-", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 1', function() {
      let significand = new UOARNumber("-", "14", "37", 10, NumberTypes.SIGNED);
      let exponent = "-15";
      let res = new IEEE754Number("1", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('invalid exponent', function() {
      let significand = new UOARNumber("-", "14", "37", 10, NumberTypes.SIGNED);
      let exponent = "A";
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.be.null;
    });

    it('exponent below lower bound', function() {
      let significand = new UOARNumber("+", "1", "", 10, NumberTypes.SIGNED);
      let exponent = (DECIMAL32.MIN_EXPONENT-1).toString();
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.be.null;
    });

    it('exponent above upper bound', function() {
      let significand = new UOARNumber("+", "1", "", 10, NumberTypes.SIGNED);
      let exponent = (DECIMAL32.MAX_EXPONENT+1).toString();
      expect(convertToIEEE754Decimal32BID(significand, exponent, true, false)).to.be.null;
    });

  });

  describe('convertToIEEE754Hexadecimal32', function() {

    it('not signed significand', function() {
      let significand = new UOARNumber("", "202", "515625", 10, NumberTypes.UNSIGNED);
      let exponent = "0";
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.be.null;
    });

    it('not standardized significand', function() {
      let significand = new UOARNumber("--++", "00202", "51562500", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("0", "1000010", "110010101000010000000000", IEEE754Formats.HEXADECIMAL32);
      expect(convertToIEEE754Hexadecimal32(significand, exponent, false, false)).to.deep.equal(res);
    });

    it('invalid significand', function() {
      let significand = new UOARNumber("+", "2A2", "515625", 10, NumberTypes.SIGNED);
      let exponent = "0";
      expect(convertToIEEE754Hexadecimal32(significand, exponent, false, false)).to.be.null;
    });

    it('positive infinity', function() {
      let significand = new UOARNumber("+", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.HEXADECIMAL32);
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('negative infinity', function() {
      let significand = new UOARNumber("-", "50000000", "", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.HEXADECIMAL32);
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 1', function() {
      let significand = new UOARNumber("+", "202", "515625", 10, NumberTypes.SIGNED);
      let exponent = "0";
      let res = new IEEE754Number("0", "1000010", "110010101000010000000000", IEEE754Formats.HEXADECIMAL32);
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let significand = new UOARNumber("-", "2192", "75", 10, NumberTypes.SIGNED);
      let exponent = "4";
      let res = new IEEE754Number("1", "1000111", "100010010000110000000000", IEEE754Formats.HEXADECIMAL32);
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.deep.equal(res);
    });

    it('invalid exponent', function() {
      let significand = new UOARNumber("+", "202", "515625", 10, NumberTypes.SIGNED);
      let exponent = "A";
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.be.null;
    });

    it('exponent below lower bound', function() {
      let significand = new UOARNumber("+", "0", "1", 10, NumberTypes.SIGNED);
      let exponent = (HEXADECIMAL32.MIN_EXPONENT-1).toString();
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.be.null;
    });

    it('exponent above upper bound', function() {
      let significand = new UOARNumber("+", "0", "1", 10, NumberTypes.SIGNED);
      let exponent = (HEXADECIMAL32.MAX_EXPONENT+1).toString();
      expect(convertToIEEE754Hexadecimal32(significand, exponent, true, false)).to.be.null;
    });

  });

  describe('normalizeBinary', function() {

    it('not standardized', function() {
      let significand = new UOARNumber("+-", "001000111", "1100", 2, NumberTypes.SIGNED);
      let normalized = normalizeBinary(significand, false, false);
      let res = new SignificandExponentPair(new UOARNumber("-", "1", "00011111", 2, NumberTypes.SIGNED), 2, 6, "");
      expect(normalized).to.deep.equal(res);
    });

    it('positive exponent', function() {
      let significand = new UOARNumber("+", "1000111", "11", 2, NumberTypes.SIGNED);
      let normalized = normalizeBinary(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "1", "00011111", 2, NumberTypes.SIGNED), 2, 6, "");
      expect(normalized).to.deep.equal(res);
    });

    it('negative exponent', function() {
      let significand = new UOARNumber("+", "0", "011001", 2, NumberTypes.SIGNED);
      let normalized = normalizeBinary(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "1", "1001", 2, NumberTypes.SIGNED), 2, -2, "");
      expect(normalized).to.deep.equal(res);
    });

    it('already normalized', function() {
      let significand = new UOARNumber("+", "1", "10011", 2, NumberTypes.SIGNED);
      let normalized = normalizeBinary(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "1", "10011", 2, NumberTypes.SIGNED), 2, 0, "");
      expect(normalized).to.deep.equal(res);
    });

  });

  describe('normalizeDecimal', function() {

    it('not standardized', function() {
      let significand = new UOARNumber("+-", "0017", "00", 10, NumberTypes.SIGNED);
      let normalized = normalizeDecimal(significand, false, false);
      let res = new SignificandExponentPair(new UOARNumber("-", "17", "", 10, NumberTypes.SIGNED), 10, 0, "");
      expect(normalized).to.deep.equal(res);
    });

    it('negative exponent', function() {
      let significand = new UOARNumber("-", "0", "045781", 10, NumberTypes.SIGNED);
      let normalized = normalizeDecimal(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("-", "45781", "", 10, NumberTypes.SIGNED), 10, -6, "");
      expect(normalized).to.deep.equal(res);
    });

    it('already normalized', function() {
      let significand = new UOARNumber("+", "17", "", 10, NumberTypes.SIGNED);
      let normalized = normalizeDecimal(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "17", "", 10, NumberTypes.SIGNED), 10, 0, "");
      expect(normalized).to.deep.equal(res);
    });

    it('rounding', function() {
      let significand = new UOARNumber("+", "864", "5193822", 10, NumberTypes.SIGNED);
      let normalized = normalizeDecimal(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "8645194", "", 10, NumberTypes.SIGNED), 10, -4, "");
      expect(normalized).to.deep.equal(res);
    });

    it('too large', function() {
      let significand = new UOARNumber("+", "10000000", "", 10, NumberTypes.SIGNED);
      let normalized = normalizeDecimal(significand, true, false);
      expect(normalized).to.be.null;
    });

  });

  describe('normalizeHexadecimal', function() {

    it('not standardized', function() {
      let significand = new UOARNumber("+-", "00CA", "8400", 16, NumberTypes.SIGNED);
      let normalized = normalizeHexadecimal(significand, false, false);
      let res = new SignificandExponentPair(new UOARNumber("-", "0", "CA8400", 16, NumberTypes.SIGNED), 16, 2, "");
      expect(normalized).to.deep.equal(res);
    });

    it('positive exponent', function() {
      let significand = new UOARNumber("+", "CA", "84", 16, NumberTypes.SIGNED);
      let normalized = normalizeHexadecimal(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "0", "CA8400", 16, NumberTypes.SIGNED), 16, 2, "");
      expect(normalized).to.deep.equal(res);
    });

    it('negative exponent', function() {
      let significand = new UOARNumber("-", "0", "01F", 16, NumberTypes.SIGNED);
      let normalized = normalizeHexadecimal(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("-", "0", "1F0000", 16, NumberTypes.SIGNED), 16, -1, "");
      expect(normalized).to.deep.equal(res);
    });

    it('already normalized', function() {
      let significand = new UOARNumber("+", "0", "A5", 16, NumberTypes.SIGNED);
      let normalized = normalizeHexadecimal(significand, true, false);
      let res = new SignificandExponentPair(new UOARNumber("+", "0", "A50000", 16, NumberTypes.SIGNED), 16, 0, "");
      expect(normalized).to.deep.equal(res);
    });

  });

  describe('decimalToDPD', function() {

    it('non binary', function() {
      expect(decimalToDPD("100201101110", false)).to.be.null;
    });

    it('non unsigned', function() {
      expect(decimalToDPD("+100101101110", false)).to.be.null;
    });

    it('valid numbers', function() {
      expect(decimalToDPD("010001101000", false)).to.equal("1001101000");
      expect(decimalToDPD("100101010111", false)).to.equal("1111011101");
      expect(decimalToDPD("000001000101", false)).to.equal("0001000101");
      expect(decimalToDPD("011110000001", false)).to.equal("1110001011");
      expect(decimalToDPD("011001000101", false)).to.equal("1101000101");
      expect(decimalToDPD("000110010100", false)).to.equal("0011011010");
    });

    it('padding', function() {
      expect(decimalToDPD("01000101", false)).to.equal("0001000101");
    });

    it('splitting', function() {
      expect(decimalToDPD("000101110011010110011000", false)).to.equal("00111100111011011110");
    });

  });

  describe('DPDtoDecimal', function() {

    it('non binary', function() {
      expect(DPDtoDecimal("1110002110", false)).to.be.null;
    });

    it('non unsigned', function() {
      expect(DPDtoDecimal("+1110001110", false)).to.be.null;
    });

    it('valid numbers', function() {
      expect(DPDtoDecimal("1001101000", false)).to.equal("010001101000");
      expect(DPDtoDecimal("1111011101", false)).to.equal("100101010111");
      expect(DPDtoDecimal("0001000101", false)).to.equal("000001000101");
      expect(DPDtoDecimal("1110001011", false)).to.equal("011110000001");
    });

    it('padding', function() {
      expect(DPDtoDecimal("1000101", false)).to.equal("000001000101");
    });

    it('splitting', function() {
      expect(DPDtoDecimal("00111100111011011110", false)).to.equal("000101110011010110011000");
    });

  });

  describe('isValidIEEE754', function() {

    it('null value', function() {
      expect(isValidIEEE754(null)).to.be.false;
    });

    it('invalid sign value', function() {
      let number = new IEEE754Number("2", "11111111", "11111111111111111111111");
      expect(isValidIEEE754(number)).to.be.false;
    });

    it('invalid sign length', function() {
      let number = new IEEE754Number("00", "11111111", "11111111111111111111111");
      expect(isValidIEEE754(number)).to.be.false;
    });

    it('binary 32', function() {
      let number = new IEEE754Number("0", "10001010", "00110010000000000000000", IEEE754Formats.BINARY32);
      expect(isValidIEEE754(number)).to.be.true;
    });

    it('binary 64', function() {
      let number = new IEEE754Number("1", "10000000110", "1000111101000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(isValidIEEE754(number)).to.be.true;
    });

    it('decimal 32 DPD', function() {
      let number = new IEEE754Number("1", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
      expect(isValidIEEE754(number)).to.be.true;
    });

    it('decimal 32 BID', function() {
      let number = new IEEE754Number("1", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
      expect(isValidIEEE754(number)).to.be.true;
    });

    it('hexadecimal 32', function() {
      let number = new IEEE754Number("0", "1000010", "110010101000010000000000", IEEE754Formats.HEXADECIMAL32);
      expect(isValidIEEE754(number)).to.be.true;
    });

  });

  describe('toIEEE754Number', function() {

    it('null value', function(){
      expect(toIEEE754Number(null, IEEE754Formats.BINARY32, false)).to.be.null;
    });

    it('binary32 valid', function(){
      let number = "0 00110111 10010100000000000000000";
      let res = new IEEE754Number("0", "00110111", "10010100000000000000000", IEEE754Formats.BINARY32);
      expect(toIEEE754Number(number, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
    });

    it('binary32 invalid', function(){
      let number = "0 00110111 1001010000000000000000";
      expect(toIEEE754Number(number, IEEE754Formats.BINARY32, false)).to.be.null;
    });

    it('binary64 valid', function(){
      let number = "1 10000001001 1011110100100010000000000000000000000000000000000000";
      let res = new IEEE754Number("1", "10000001001", "1011110100100010000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(toIEEE754Number(number, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
    });

    it('binary64 invalid', function(){
      let number = "1 10000001001 101111010010001000000000000000000000000000000000000";
      expect(toIEEE754Number(number, IEEE754Formats.BINARY64, false)).to.be.null;
    });

    it('decimal32DPD valid', function(){
      let number = "1 01010100001 10011010001111011101";
      let res = new IEEE754Number("1", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
      expect(toIEEE754Number(number, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
    });

    it('decimal32DPD invalid', function(){
      let number = "1 0101010001 10011010001111011101";
      expect(toIEEE754Number(number, IEEE754Formats.DECIMAL32DPD, false)).to.be.null;
    });

    it('decimal32BID valid', function(){
      let number = "1 01010100000 00000000010110011101";
      let res = new IEEE754Number("1", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
      expect(toIEEE754Number(number, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
    });

    it('decimal32BID invalid', function(){
      let number = "1 0101010000 00000000010110011101";
      expect(toIEEE754Number(number, IEEE754Formats.DECIMAL32BID, false)).to.be.null;
    });

    it('hexadecimal32 valid', function(){
      let number = "0 1000011 001011100011100000000000";
      let res = new IEEE754Number("0", "1000011", "001011100011100000000000", IEEE754Formats.HEXADECIMAL32);
      expect(toIEEE754Number(number, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
    });

    it('hexadecimal32 invalid', function(){
      let number = "0 1000011 00101110001110000000000";
      expect(toIEEE754Number(number, IEEE754Formats.HEXADECIMAL32, false)).to.be.null;
    });

  });

  describe('getSpecialValueBinary32', function() {

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number, false)).to.be.null;
    });

    it('positive zero', function(){
      let number = new IEEE754Number("0", "00000000", "00000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number, false)).to.deep.equal(POS_ZERO);
    });

    it('negative zero', function(){
      let number = new IEEE754Number("1", "00000000", "00000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number, false)).to.deep.equal(NEG_ZERO);
    });

    it('positive infinity', function(){
      let number = new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number, false)).to.deep.equal(POS_INF);
    });

    it('negative infinity', function(){
      let number = new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number, false)).to.deep.equal(NEG_INF);
    });

    it('qNaN', function(){
      let number_pos = new IEEE754Number("0", "11111111", "10000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number_pos, false)).to.deep.equal(QNAN);
      let number_neg = new IEEE754Number("1", "11111111", "10000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number_neg, false)).to.deep.equal(QNAN);
    });

    it('sNaN', function(){
      let number_pos = new IEEE754Number("0", "11111111", "01000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number_pos, false)).to.deep.equal(SNAN);
      let number_neg = new IEEE754Number("1", "11111111", "01000000000000000000000", IEEE754Formats.BINARY32);
      expect(getSpecialValueBinary32(number_neg, false)).to.deep.equal(SNAN);
    });

  });

  describe('getSpecialValueBinary64', function() {

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number, false)).to.be.null;
    });

    it('positive zero', function(){
      let number = new IEEE754Number("0", "00000000000", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number, false)).to.deep.equal(POS_ZERO);
    });

    it('negative zero', function(){
      let number = new IEEE754Number("1", "00000000000", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number, false)).to.deep.equal(NEG_ZERO);
    });

    it('positive infinity', function(){
      let number = new IEEE754Number("0", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number, false)).to.deep.equal(POS_INF);
    });

    it('negative infinity', function(){
      let number = new IEEE754Number("1", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number, false)).to.deep.equal(NEG_INF);
    });

    it('qNaN', function(){
      let number_pos = new IEEE754Number("0", "11111111111", "1000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number_pos, false)).to.deep.equal(QNAN);
      let number_neg = new IEEE754Number("1", "11111111111", "1000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number_neg, false)).to.deep.equal(QNAN);
    });

    it('sNaN', function(){
      let number_pos = new IEEE754Number("0", "11111111111", "0100000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number_pos, false)).to.deep.equal(SNAN);
      let number_neg = new IEEE754Number("1", "11111111111", "0100000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(getSpecialValueBinary64(number_neg, false)).to.deep.equal(SNAN);
    });

  });

  describe('getSpecialValueDecimal32', function() {

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number, false)).to.be.null;
    });

    it('positive zero', function(){
      let number = new IEEE754Number("0", "01000111111", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number, false)).to.deep.equal(POS_ZERO);
    });

    it('negative zero', function(){
      let number = new IEEE754Number("1", "01000111111", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number, false)).to.deep.equal(NEG_ZERO);
    });

    it('positive infinity', function(){
      let number = new IEEE754Number("0", "11110111111", "10000000001000000000", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number, false)).to.deep.equal(POS_INF);
    });

    it('negative infinity', function(){
      let number = new IEEE754Number("1", "11110111111", "10000000001000000000", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number, false)).to.deep.equal(NEG_INF);
    });

    it('qNaN', function(){
      let number_pos = new IEEE754Number("0", "11111011111", "10000000001000000000", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number_pos, false)).to.deep.equal(QNAN);
      let number_neg = new IEEE754Number("1", "11111000000", "01111111110111111111", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number_neg, false)).to.deep.equal(QNAN);
    });

    it('sNaN', function(){
      let number_pos = new IEEE754Number("0", "11111100000", "10000000001000000000", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number_pos, false)).to.deep.equal(SNAN);
      let number_neg = new IEEE754Number("1", "11111111111", "01111111110111111111", IEEE754Formats.DECIMAL32DPD);
      expect(getSpecialValueDecimal32(number_neg, false)).to.deep.equal(SNAN);
    });

  });

  describe('convertFromIEEE754Binary32', function(){

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.BINARY32);
      expect(convertFromIEEE754Binary32(number, false)).to.be.null;
    });

    it('normal number', function(){
      let number = new IEEE754Number("1", "10000110", "00010011010100000000000", IEEE754Formats.BINARY32);
      let res = new SignificandExponentPair(new UOARNumber("-", "137", "65625", 10, NumberTypes.SIGNED), 2, 0);
      expect(convertFromIEEE754Binary32(number, false)).to.deep.equal(res);
    });

    it('subnormal number', function(){
      let number = new IEEE754Number("1", "00000000", "00000010001000000000000", IEEE754Formats.BINARY32);
      let res = new SignificandExponentPair(new UOARNumber("-", "17", "", 10, NumberTypes.SIGNED), 2, -137);
      expect(convertFromIEEE754Binary32(number, false)).to.deep.equal(res);
    });

    it('special value', function(){
      let number = new IEEE754Number("1", "11111111", "10000000000000000000000", IEEE754Formats.BINARY32);
      expect(convertFromIEEE754Binary32(number, false)).to.deep.equal(QNAN);
    });

  });

  describe('convertFromIEEE754Binary64', function(){

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.BINARY64);
      expect(convertFromIEEE754Binary64(number, false)).to.be.null;
    });

    it('normal number', function(){
      let number = new IEEE754Number("1", "10000011001", "1011000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      let res = new SignificandExponentPair(new UOARNumber("-", "27", "", 10, NumberTypes.SIGNED), 2, 22);
      expect(convertFromIEEE754Binary64(number, false)).to.deep.equal(res);
    });

    it('subnormal number', function(){
      let number = new IEEE754Number("1", "00000000000", "1010000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      let res = new SignificandExponentPair(new UOARNumber("-", "5", "", 10, NumberTypes.SIGNED), 2, -1025);
      expect(convertFromIEEE754Binary64(number, false)).to.deep.equal(res);
    });

    it('special value', function(){
      let number = new IEEE754Number("1", "11111111111", "1000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
      expect(convertFromIEEE754Binary64(number, false)).to.deep.equal(QNAN);
    });

  });

  describe('convertFromIEEE754Decimal32DPD', function(){

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.DECIMAL32DPD);
      expect(convertFromIEEE754Decimal32DPD(number, false)).to.be.null;
    });

    it('normal number', function(){
      let number = new IEEE754Number("0", "10000110010", "11100011100000000000", IEEE754Formats.DECIMAL32DPD);
      let res = new SignificandExponentPair(new UOARNumber("+", "986", "", 10, NumberTypes.SIGNED), 10, 80);
      expect(convertFromIEEE754Decimal32DPD(number, false)).to.deep.equal(res);
    });

    it('special value', function(){
      let number = new IEEE754Number("0", "11111000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
      expect(convertFromIEEE754Decimal32DPD(number, false)).to.deep.equal(QNAN);
    });

  });

  describe('convertFromIEEE754Decimal32BID', function(){

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.DECIMAL32BID);
      expect(convertFromIEEE754Decimal32BID(number, false)).to.be.null;
    });

    it('normal number', function(){
      let number = new IEEE754Number("1", "11011010000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
      let res = new SignificandExponentPair(new UOARNumber("-", "8388608", "", 10, NumberTypes.SIGNED), 10, 3);
      expect(convertFromIEEE754Decimal32BID(number, false)).to.deep.equal(res);
    });

    it('special value', function(){
      let number = new IEEE754Number("0", "11111000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
      expect(convertFromIEEE754Decimal32BID(number, false)).to.deep.equal(QNAN);
    });

  });

  describe('convertFromIEEE754Hexadecimal32', function(){

    it('invalid number', function(){
      let number = new IEEE754Number("", "", "", IEEE754Formats.HEXADECIMAL32);
      expect(convertFromIEEE754Hexadecimal32(number, false)).to.be.null;
    });

    it('normal number', function(){
      let number = new IEEE754Number("0", "1000011", "001011100011100000000000", IEEE754Formats.HEXADECIMAL32);
      let res = new SignificandExponentPair(new UOARNumber("+", "739", "5", 10, NumberTypes.SIGNED), 16, 0);
      expect(convertFromIEEE754Hexadecimal32(number, false)).to.deep.equal(res);
    });

    it('subnormal number', function(){
      let number = new IEEE754Number("1", "0000000", "000000010001000000000000", IEEE754Formats.HEXADECIMAL32);
      let res = new SignificandExponentPair(new UOARNumber("-", "17", "", 10, NumberTypes.SIGNED), 16, -67);
      expect(convertFromIEEE754Hexadecimal32(number, false)).to.deep.equal(res);
    });

  });

});