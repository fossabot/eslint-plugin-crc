const libCrc = require('require-dir')('../lib', {camelcase: true});
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const {expect} = chai;
const CrcModelListVisitor = libCrc.crcModelListVisitor;

describe('CrcModelListVisitor is an "interface" object that all Visitors should extend, since', () => {
    it('declares a "visit" method that returns {void} (i.e., undefined)', () => {
        expect(CrcModelListVisitor).not.to.be.undefined();
        let visitor = new CrcModelListVisitor();
        expect(visitor).to.be.ok();
        expect(visitor.visit).to.be.ok();
        let result = visitor.visit();
        expect(result).to.be.undefined();
    });
});
