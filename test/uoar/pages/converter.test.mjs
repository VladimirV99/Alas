import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes, PRECISION } from '../../../src/uoar1/uoar_core.mjs';
import { convertToBase, convertToType } from '../../../src/uoar1/converter/converter.mjs';
import { createConstantString } from '../../../src/uoar1/util.mjs';

describe('Converter', function() {

  describe('convertToBase', function() {

    it('empty input', function() {
      expect(convertToBase("", "", "", false)).to.be.null;
    });

    it('invalid source base', function() {
      let number = "13032";
      let base_from = 1;
      let base_to = 9;
      expect(convertToBase(number, base_from, base_to, false)).to.be.null;
    });

    it('invalid destination base', function() {
      let number = "13032";
      let base_from = 4;
      let base_to = 1;
      expect(convertToBase(number, base_from, base_to, false)).to.be.null;
    });
    
    it('invalid number', function() {
      let number = "13052";
      let base_from = 4;
      let base_to = 9;
      expect(convertToBase(number, base_from, base_to, false)).to.be.null;
    });

    it('not standardized', function() {
      let number = "--002301.3200";
      let base_from = 4;
      let base_to = 6;
      let res = new UOARNumber("+", "453", "513", base_to, NumberTypes.SIGNED);
      expect(convertToBase(number, base_from, base_to, false)).to.deep.equal(res);
    });
    
    it('whole number', function() {
      let number = "13032";
      let base_from = 4;
      let base_to = 9;
      let res = new UOARNumber("+", "563", "", base_to, NumberTypes.SIGNED);
      expect(convertToBase(number, base_from, base_to, false)).to.deep.equal(res);
    });

    it('real number', function() {
      let number = "2301.32";
      let base_from = 4;
      let base_to = 6;
      let res = new UOARNumber("+", "453", "513", base_to, NumberTypes.SIGNED);
      expect(convertToBase(number, base_from, base_to, false)).to.deep.equal(res);
    });

    it('repeating fraction', function() {
      let number = "2102.2";
      let base_from = 3;
      let base_to = 4;
      let res = new UOARNumber("+", "1001", createConstantString("2", PRECISION), base_to, NumberTypes.SIGNED);
      expect(convertToBase(number, base_from, base_to, false)).to.deep.equal(res);
    });

    it('negative number', function() {
      let number = "-2301.32";
      let base_from = 4;
      let base_to = 6;
      let res = new UOARNumber("-", "453", "513", base_to, NumberTypes.SIGNED);
      expect(convertToBase(number, base_from, base_to, false)).to.deep.equal(res);
    });

  });

  describe('convertToType', function() {

    it('empty input', function() {
      expect(convertToType("", "", false)).to.be.null;
    });

    it('invalid base', function() {
      let number = "13032";
      let base = 1;
      expect(convertToType(number, base, false)).to.be.null;
    });
    
    it('invalid number', function() {
      let number = "186.3";
      let base = 7;
      expect(convertToType(number, base, false)).to.be.null;
    });

    it('not standardized', function() {
      let number = "--00156.300";
      let base = 7;
      let res = {
        signed: new UOARNumber("+", "156", "3", base, NumberTypes.SIGNED),
        smr: new UOARNumber("0", "156", "3", base, NumberTypes.SMR),
        oc: new UOARNumber("0", "156", "3", base, NumberTypes.OC),
        tc: new UOARNumber("0", "156", "3", base, NumberTypes.TC)
      };
      expect(convertToType(number, base, false)).to.deep.equal(res);
    });
    
    it('positive number', function() {
      let number = "156.3";
      let base = 7;
      let res = {
        signed: new UOARNumber("+", "156", "3", base, NumberTypes.SIGNED),
        smr: new UOARNumber("0", "156", "3", base, NumberTypes.SMR),
        oc: new UOARNumber("0", "156", "3", base, NumberTypes.OC),
        tc: new UOARNumber("0", "156", "3", base, NumberTypes.TC)
      };
      expect(convertToType(number, base, false)).to.deep.equal(res);
    });

    it('negative number', function() {
      let number = "-203.1";
      let base = 4;
      let res = {
        signed: new UOARNumber("-", "203", "1", base, NumberTypes.SIGNED),
        smr: new UOARNumber("3", "203", "1", base, NumberTypes.SMR),
        oc: new UOARNumber("3", "130", "2", base, NumberTypes.OC),
        tc: new UOARNumber("3", "130", "3", base, NumberTypes.TC)
      };
      expect(convertToType(number, base, false)).to.deep.equal(res);
    });

  });
    
});