import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../../../src/uoar1/uoar_core.mjs';
import {
  IEEE754Number, IEEE754Formats, SignificandExponentPair, BINARY32, BINARY64, DECIMAL32, HEXADECIMAL32, BINARY32_SPECIAL_VALUES, QNAN
} from '../../../src/uoar1/ieee754_core.mjs';
import { ArithmeticOperations } from '../../../src/uoar1/ieee754_arithmetic.mjs';
import {
  convertToIEEE754, convertFromIEEE754, doOperation
} from '../../../src/uoar1/ieee754/ieee754.mjs';

let pos_zero = "0 00000000 00000000000000000000000";
let neg_zero = "1 00000000 00000000000000000000000";
let pos_inf = "0 11111111 00000000000000000000000";
let neg_inf = "1 11111111 00000000000000000000000";
let qnan = "0 11111111 01000000000000000000000";
let snan = "0 11111111 11000000000000000000000";

describe('IEEE754', function() {

  describe('convertToIEEE754', function() {

    describe('binary32', function() {

      it('not signed significand', function() {
        let significand = "50";
        let exponent = "10";
        let res = new IEEE754Number("0", "10001110", "10010000000000000000000", IEEE754Formats.BINARY32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('not standardized significand', function() {
        let significand = "--++0019.12500";
        let exponent = "7";
        let res = new IEEE754Number("0", "10001010", "00110010000000000000000", IEEE754Formats.BINARY32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('invalid significand', function() {
        let significand = "+1A.125";
        let exponent = "7";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.be.null;
      });

      it('positive infinity', function() {
        let significand = "+50000000";
        let exponent = "10";
        let res = new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('negative infinity', function() {
        let significand = "-50000000";
        let exponent = "10";
        let res = new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('example 1', function() {
        let significand = "+19.125";
        let exponent = "7";
        let res = new IEEE754Number("0", "10001010", "00110010000000000000000", IEEE754Formats.BINARY32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('example 2', function() {
        let significand = "-71.75";
        let exponent = "-13";
        let res = new IEEE754Number("1", "01111000", "00011111000000000000000", IEEE754Formats.BINARY32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('invalid exponent', function() {
        let significand = "-71.75";
        let exponent = "A";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.be.null;
      });

      it('exponent below lower bound', function() {
        let significand = "+1.5";
        let exponent = (BINARY32.MIN_EXPONENT-1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.be.null;
      });

      it('exponent above upper bound', function() {
        let significand = "+1.5";
        let exponent = (BINARY32.MAX_EXPONENT+1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY32, false)).to.be.null;
      });

    });

    describe('binary64', function() {

      it('not signed significand', function() {
        let significand = "50";
        let exponent = "10";
        let res = new IEEE754Number("0", "10000001110", "1001000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });
  
      it('not standardized significand', function() {
        let significand = "--+-00199.62500";
        let exponent = "0";
        let res = new IEEE754Number("1", "10000000110", "1000111101000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });
  
      it('invalid significand', function() {
        let significand = "+1A9.625";
        let exponent = "0";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.be.null;
      });
  
      it('positive infinity', function() {
        let significand = "+5000000000000000";
        let exponent = "10";
        let res = new IEEE754Number("0", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });
  
      it('negative infinity', function() {
        let significand = "-5000000000000000";
        let exponent = "10";
        let res = new IEEE754Number("1", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });
  
      it('example 1', function() {
        let significand = "-199.625";
        let exponent = "0";
        let res = new IEEE754Number("1", "10000000110", "1000111101000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });
  
      it('example 2', function() {
        let significand = "-1780.53125";
        let exponent = "0";
        let res = new IEEE754Number("1", "10000001001", "1011110100100010000000000000000000000000000000000000", IEEE754Formats.BINARY64);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });
  
      it('invalid exponent', function() {
        let significand = "-199.625";
        let exponent = "A";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.be.null;
      });
  
      it('exponent below lower bound', function() {
        let significand = "+1.5";
        let exponent = (BINARY64.MIN_EXPONENT-1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.be.null;
      });
  
      it('exponent above upper bound', function() {
        let significand = "+1.5";
        let exponent = (BINARY64.MAX_EXPONENT+1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.BINARY64, false)).to.be.null;
      });
  
    });

    describe('decimal32 DPD', function() {

      it('not signed significand', function() {
        let significand = "246.8957";
        let exponent = "0";
        let res = new IEEE754Number("0", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('not standardized significand', function() {
        let significand = "--+-00246.895700";
        let exponent = "0";
        let res = new IEEE754Number("1", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('invalid significand', function() {
        let significand = "-2A6.8957";
        let exponent = "0";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.be.null;
      });
  
      it('positive infinity', function() {
        let significand = "+50000000";
        let exponent = "0";
        let res = new IEEE754Number("0", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('negative infinity', function() {
        let significand = "-50000000";
        let exponent = "0";
        let res = new IEEE754Number("1", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('example 1', function() {
        let significand = "-246.8957";
        let exponent = "0";
        let res = new IEEE754Number("1", "01010100001", "10011010001111011101", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('example 2', function() {
        let significand = "-8645.193822";
        let exponent = "-1";
        let res = new IEEE754Number("1", "11010100001", "11010001010011011010", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('example 3', function() {
        let significand = "+0.9173598";
        let exponent = "0";
        let res = new IEEE754Number("0", "11011011110", "00111100111011011110", IEEE754Formats.DECIMAL32DPD);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });
  
      it('invalid exponent', function() {
        let significand = "-246.8957";
        let exponent = "A";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.be.null;
      });
  
      it('exponent below lower bound', function() {
        let significand = "+1";
        let exponent = (DECIMAL32.MIN_EXPONENT-1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.be.null;
      });
  
      it('exponent above upper bound', function() {
        let significand = "+1";
        let exponent = (DECIMAL32.MAX_EXPONENT+1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32DPD, false)).to.be.null;
      });
  
    });

    describe('decimal32 BID', function() {

      it('not signed significand', function() {
        let significand = "14.37";
        let exponent = "-15";
        let res = new IEEE754Number("0", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
      });

      it('not standardized significand', function() {
        let significand = "--+-0014.3700";
        let exponent = "-15";
        let res = new IEEE754Number("1", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
      });

      it('invalid significand', function() {
        let significand = "-1A.37";
        let exponent = "-15";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.be.null;
      });

      it('positive infinity', function() {
        let significand = "+50000000";
        let exponent = "0";
        let res = new IEEE754Number("0", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
      });

      it('negative infinity', function() {
        let significand = "-50000000";
        let exponent = "0";
        let res = new IEEE754Number("1", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
      });

      it('example 1', function() {
        let significand = "-14.37";
        let exponent = "-15";
        let res = new IEEE754Number("1", "01010100000", "00000000010110011101", IEEE754Formats.DECIMAL32BID);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
      });

      it('invalid exponent', function() {
        let significand = "-14.37";
        let exponent = "A";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.be.null;
      });

      it('exponent below lower bound', function() {
        let significand = "+1";
        let exponent = (DECIMAL32.MIN_EXPONENT-1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.be.null;
      });

      it('exponent above upper bound', function() {
        let significand = "+1";
        let exponent = (DECIMAL32.MAX_EXPONENT+1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.DECIMAL32BID, false)).to.be.null;
      });

    });

    describe('hexadecimal32', function() {

      it('not signed significand', function() {
        let significand = "202.515625";
        let exponent = "0";
        let res = new IEEE754Number("0", "1000010", "110010101000010000000000", IEEE754Formats.HEXADECIMAL32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('not standardized significand', function() {
        let significand = "--++00202.51562500";
        let exponent = "0";
        let res = new IEEE754Number("0", "1000010", "110010101000010000000000", IEEE754Formats.HEXADECIMAL32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('invalid significand', function() {
        let significand = "+2A2.515625";
        let exponent = "0";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.be.null;
      });

      it('positive infinity', function() {
        let significand = "+50000000";
        let exponent = "0";
        let res = new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.HEXADECIMAL32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('negative infinity', function() {
        let significand = "-50000000";
        let exponent = "0";
        let res = new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.HEXADECIMAL32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('example 1', function() {
        let significand = "+202.515625";
        let exponent = "0";
        let res = new IEEE754Number("0", "1000010", "110010101000010000000000", IEEE754Formats.HEXADECIMAL32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('example 2', function() {
        let significand = "-2192.75";
        let exponent = "4";
        let res = new IEEE754Number("1", "1000111", "100010010000110000000000", IEEE754Formats.HEXADECIMAL32);
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('invalid exponent', function() {
        let significand = "+202.515625";
        let exponent = "A";
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.be.null;
      });

      it('exponent below lower bound', function() {
        let significand = "+0.1";
        let exponent = (HEXADECIMAL32.MIN_EXPONENT-1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.be.null;
      });

      it('exponent above upper bound', function() {
        let significand = "+0.1";
        let exponent = (HEXADECIMAL32.MAX_EXPONENT+1).toString();
        expect(convertToIEEE754(significand, exponent, IEEE754Formats.HEXADECIMAL32, false)).to.be.null;
      });

    });

  });

  describe('convertFromIEEE754', function() {

    describe('binary32', function(){

      it('invalid number', function(){
        let number = "";
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY32, false)).to.be.null;
      });

      it('normal number', function(){
        let number = "1 10000110 00010011010100000000000";
        let res = new SignificandExponentPair(new UOARNumber("-", "137", "65625", 10, NumberTypes.SIGNED), 2, 0);
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('subnormal number', function(){
        let number = "1 00000000 00000010001000000000000";
        let res = new SignificandExponentPair(new UOARNumber("-", "17", "", 10, NumberTypes.SIGNED), 2, -137);
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY32, false)).to.deep.equal(res);
      });

      it('special value', function(){
        let number = "1 11111111 10000000000000000000000";
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY32, false)).to.deep.equal(QNAN);
      });

    });

    describe('binary64', function(){

      it('invalid number', function(){
        let number = "";
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY64, false)).to.be.null;
      });

      it('normal number', function(){
        let number = "1 10000011001 1011000000000000000000000000000000000000000000000000";
        let res = new SignificandExponentPair(new UOARNumber("-", "27", "", 10, NumberTypes.SIGNED), 2, 22);
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });

      it('subnormal number', function(){
        let number = "1 00000000000 1010000000000000000000000000000000000000000000000000";
        let res = new SignificandExponentPair(new UOARNumber("-", "5", "", 10, NumberTypes.SIGNED), 2, -1025);
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY64, false)).to.deep.equal(res);
      });

      it('special value', function(){
        let number = "1 11111111111 1000000000000000000000000000000000000000000000000000";
        expect(convertFromIEEE754(number, IEEE754Formats.BINARY64, false)).to.deep.equal(QNAN);
      });

    });

    describe('decimal32 DPD', function(){

      it('invalid number', function(){
        let number = "";
        expect(convertFromIEEE754(number, IEEE754Formats.DECIMAL32DPD, false)).to.be.null;
      });

      it('normal number', function(){
        let number = "0 10000110010 11100011100000000000";
        let res = new SignificandExponentPair(new UOARNumber("+", "986", "", 10, NumberTypes.SIGNED), 10, 80);
        expect(convertFromIEEE754(number, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(res);
      });

      it('special value', function(){
        let number = "0 11111000000 00000000000000000000";
        expect(convertFromIEEE754(number, IEEE754Formats.DECIMAL32DPD, false)).to.deep.equal(QNAN);
      });

    });

    describe('convertFromIEEE754Decimal32BID', function(){

      it('invalid number', function(){
        let number = "";
        expect(convertFromIEEE754(number, IEEE754Formats.DECIMAL32BID, false)).to.be.null;
      });

      it('normal number', function(){
        let number = "1 11011010000 00000000000000000000";
        let res = new SignificandExponentPair(new UOARNumber("-", "8388608", "", 10, NumberTypes.SIGNED), 10, 3);
        expect(convertFromIEEE754(number, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(res);
      });

      it('special value', function(){
        let number = "0 11111000000 00000000000000000000";
        expect(convertFromIEEE754(number, IEEE754Formats.DECIMAL32BID, false)).to.deep.equal(QNAN);
      });

    });

    describe('hexadecimal32', function(){

      it('invalid number', function(){
        let number = "";
        expect(convertFromIEEE754(number, IEEE754Formats.HEXADECIMAL32, false)).to.be.null;
      });

      it('normal number', function(){
        let number = "0 1000011 001011100011100000000000";
        let res = new SignificandExponentPair(new UOARNumber("+", "739", "5", 10, NumberTypes.SIGNED), 16, 0);
        expect(convertFromIEEE754(number, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

      it('subnormal number', function(){
        let number = "1 0000000 000000010001000000000000";
        let res = new SignificandExponentPair(new UOARNumber("-", "17", "", 10, NumberTypes.SIGNED), 16, -67);
        expect(convertFromIEEE754(number, IEEE754Formats.HEXADECIMAL32, false)).to.deep.equal(res);
      });

    });

  });

  describe('doOperation', function() {
  
    describe('addition', function() {
  
      it('invalid operand', function() {
        let operand1 = "";
        let operand2 = "";
        expect(doOperation(operand1, operand2, ArithmeticOperations.ADDITION, false)).to.be.null;
      });
  
      it('same signs', function() {
        let operand1 = "1 01110100 11001000000000000000000";
        let operand2 = "1 01110100 01011100000000000000000";
        let res = new IEEE754Number("1", "01110101", "10010010000000000000000", IEEE754Formats.BINARY32);
        expect(doOperation(operand1, operand2, ArithmeticOperations.ADDITION, false)).to.deep.equal(res);
      });
  
      it('different signs', function() {
        let operand1 = "0 10000010 10111101010000000000000";
        let operand2 = "1 10000101 10111100100000000000000";
        let res = new IEEE754Number("1", "10000101", "10000100110110000000000", IEEE754Formats.BINARY32);
        expect(doOperation(operand1, operand2, ArithmeticOperations.ADDITION, false)).to.deep.equal(res);
      });
  
      it('positive infinity', function() {
        let operand = "0 10000010 10111101010000000000000";
        expect(doOperation(operand, pos_inf, ArithmeticOperations.ADDITION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      });
  
      it('negative infinity', function() {
        let operand = "1 10000101 10111100100000000000000";
        expect(doOperation(operand, neg_inf, ArithmeticOperations.ADDITION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      });
  
      it('qnan', function() {
        let operand = "0 10000010 10111101010000000000000";
        expect(doOperation(operand, qnan, ArithmeticOperations.ADDITION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(operand, snan, ArithmeticOperations.ADDITION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(pos_inf, neg_inf, ArithmeticOperations.ADDITION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(neg_inf, pos_inf, ArithmeticOperations.ADDITION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      });
  
    });
  
    describe('subtraction', function() {
  
      it('invalid operand', function() {
        let operand1 = "";
        let operand2 = "";
        expect(doOperation(operand1, operand2, ArithmeticOperations.SUBTRACTION, false)).to.be.null;
      });
  
      it('same signs', function() {
        let operand1 = "0 10000110 10101100000000000000000";
        let operand2 = "0 10000010 01110000000000000000000";
        let res = new IEEE754Number("0", "10000110", "10010101000000000000000", IEEE754Formats.BINARY32);
        expect(doOperation(operand1, operand2, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(res);
      });
  
      it('different signs', function() {
        let operand1 = "1 10000110 10111101010000000000000";
        let operand2 = "0 10000101 10111100100000000000000";
        let res = new IEEE754Number("1", "10000111", "01001101110000000000000", IEEE754Formats.BINARY32);
        expect(doOperation(operand1, operand2, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(res);
      });
  
      it('positive infinity', function() {
        let operand = "0 10000010 10111101010000000000000";
        expect(doOperation(operand, neg_inf, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(pos_inf, operand, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      });
  
      it('negative infinity', function() {
        let operand = "1 10000101 10111100100000000000000";
        expect(doOperation(operand, pos_inf, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(neg_inf, operand, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      });
  
      it('qnan', function() {
        let operand = "0 10000010 10111101010000000000000";
        expect(doOperation(operand, qnan, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(operand, snan, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(pos_inf, pos_inf, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(neg_inf, neg_inf, ArithmeticOperations.SUBTRACTION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      });
  
    });
  
    describe('multiplication', function() {
  
      it('invalid operand', function() {
        let operand1 = "";
        let operand2 = "";
        expect(doOperation(operand1, operand2, ArithmeticOperations.MULTIPLICATION, false)).to.be.null;
      });
  
      it('valid', function() {
        let operand1 = "1 10000101 01010100000000000000000";
        let operand2 = "0 10000011 10110000000000000000000";
        let res = new IEEE754Number("1", "10001010", "00011110111000000000000", IEEE754Formats.BINARY32);
        expect(doOperation(operand1, operand2, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(res);
      });
  
      it('positive infinity', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(neg_number, neg_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(pos_inf, pos_number, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(pos_inf, pos_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(neg_inf, neg_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      });
  
      it('negative infinity', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(neg_number, pos_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(neg_inf, pos_number, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(pos_inf, neg_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(neg_inf, pos_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      });
  
      it('positive zero', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(pos_zero, pos_number, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
        expect(doOperation(neg_zero, neg_number, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      });
  
      it('negative zero', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(pos_zero, neg_number, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
        expect(doOperation(neg_zero, pos_number, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      });
  
      it('qnan', function() {
        let operand = "0 10000011 10110000000000000000000";
        expect(doOperation(operand, qnan, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(operand, snan, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(qnan, operand, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(snan, operand, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(pos_zero, neg_inf, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(pos_inf, neg_zero, ArithmeticOperations.MULTIPLICATION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      });
  
    });
  
    describe('division', function() {
  
      it('invalid operand', function() {
        let operand1 = "";
        let operand2 = "";
        expect(doOperation(operand1, operand2, ArithmeticOperations.DIVISION, false)).to.be.null;
      });
  
      it('valid', function() {
        let operand1 = "0 11010011 00001001000000000000000";
        let operand2 = "1 10101111 01000000000000000000000";
        let res = new IEEE754Number("1", "10100010", "10101000000000000000000", IEEE754Formats.BINARY32);
        expect(doOperation(operand1, operand2, ArithmeticOperations.DIVISION, false)).to.deep.equal(res);
      });
  
      it('positive infinity', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(pos_inf, pos_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(neg_inf, neg_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(pos_number, pos_zero, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
        expect(doOperation(neg_number, neg_zero, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      });
  
      it('negative infinity', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(neg_inf, pos_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(pos_inf, neg_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(pos_number, neg_zero, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
        expect(doOperation(neg_number, pos_zero, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      });
  
      it('positive zero', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(pos_zero, pos_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
        expect(doOperation(neg_zero, neg_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
        expect(doOperation(pos_number, pos_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
        expect(doOperation(neg_number, neg_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
        expect(doOperation(pos_zero, pos_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
        expect(doOperation(neg_zero, neg_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      });
  
      it('negative zero', function() {
        let pos_number = "0 10000011 10110000000000000000000";
        let neg_number = "1 10000101 01010100000000000000000";
        expect(doOperation(pos_zero, neg_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
        expect(doOperation(neg_zero, pos_number, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
        expect(doOperation(pos_number, neg_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
        expect(doOperation(neg_number, pos_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
        expect(doOperation(pos_zero, neg_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
        expect(doOperation(neg_zero, pos_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      });
  
      it('qnan', function() {
        let operand = "0 10000011 10110000000000000000000";
        expect(doOperation(operand, qnan, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(operand, snan, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(qnan, operand, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(snan, operand, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(pos_zero, neg_zero, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(neg_zero, pos_zero, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(pos_inf, neg_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
        expect(doOperation(neg_inf, pos_inf, ArithmeticOperations.DIVISION, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      });
  
    });
  
  });

});