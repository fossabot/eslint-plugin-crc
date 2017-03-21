

const relativePath = require('relative-path');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const {expect} = chai;
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const codeFixturePath = './fixtures/es5-object-identification.js';
const libCrc = require('require-dir')('../lib', {
    camelcase: true
});
const CrcModelFormatter = libCrc.crcModelFormatter;
const CrcModelList = libCrc.crcModelList;

chai.use(dirtyChai);

describe('CrcModelFormatter', function () {
    let crcModelList, formatter, template, libFilePath, code;

    before(function () {
        libFilePath = relativePath(codeFixturePath);
        code = fs.readFileSync(libFilePath);
        libFilePath = path.join(__dirname, '../lib/templates/crc-card.html');
        template = fs.readFileSync(libFilePath).toString();
        crcModelList = new CrcModelList(code);
        formatter = new CrcModelFormatter(template);
    });

    after(function () {
        template = null;
        _.map(crcModelList.models, function (model) {
            model.responsibilities = null;
        });
        crcModelList.models = null;
        crcModelList = null;
        formatter = null;
    });

    it('takes a template string', function () {
        expect(formatter.template).to.exist();
        console.log(formatter.data.meta.repository);
    });

    it('loads a default template if one isn\'t provided', function () {
        formatter = new CrcModelFormatter();
        expect(formatter.template).to.exist();
    });

    it('throws an error if a template file cannot be found');

    it('formats an CrcModelList as an HTML/markdown-friendly report of CRC "cards"', function () {
        let report;

        const loadResponsibilities = (letters) => {
            const info = 'Disambiguation for the letter ';
            const action = 'Clarifies pronunciation when spelling with the letter ';
            _.forEach(letters, function (letter, idx) {
                let faa = '"' + letter + '"';
                crcModelList.models[idx].responsibilities.push(info + faa);
                crcModelList.models[idx].responsibilities.push(action + faa);
            });
        };

        loadResponsibilities([
            'A',
            'B',
            'C',
            'D',
            'E',
            'F'
        ]);
        report = formatter.format(crcModelList);
        expect(report).to.exist();
        expect(report.length).to.be.at.least(10);
        //Console.log(report);
    });

});
