#!/usr/bin/env node --harmony
const {version} = require('../package');
const program = require('commander');
const glob = require('glob');
const concat = require('concat');
const fs = require('fs');
const path = require('path');
const CrcModelList = require('./crc-model-list');
const CrcModelFormatter = require('./crc-model-formatter');

let crcModelList;

const preprocessShebangs = (code) => {
    return code.replace('#!', '// #!');
};

const generateReport = (files, output) => {
    concat(files)
      .then(
        (code) => {
            crcModelList = new CrcModelList(preprocessShebangs(code));
            let template = fs.readFileSync(path.resolve(__dirname, 'templates', 'crc-card.html'));
            let formatter = new CrcModelFormatter(template);
            let report = formatter.format(crcModelList);
            saveToFile(report, output);
        },
        (reason) => {
            console.error(reason);
        }
    ).catch((err) => {
        console.warn(err);
    });
};

const saveToFile = (report, filepath) => {
    let buffer = new Buffer(report);

    fs.open(filepath, 'w', function(err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        }

        fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('file written');
            });
        });
    });
};

program
  .version(version)
  .description('Generates a Class-Responsibility-Collaboration report for analysis and refactoring.')
  .arguments('<files>')
  .option('-o, --output [output]', 'The report destination. Defaults to "./crc-model-report."')
  .action((filePattern) => {
      glob(filePattern, (err, files) => {
          if (err) {
              console.error(err);
          }
          let destFile = program.output || './.tmp/crc-model-report.md';
          generateReport(files, destFile);
      });
  })
  .parse(process.argv);
