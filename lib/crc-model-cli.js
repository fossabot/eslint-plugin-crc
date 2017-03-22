#!/usr/bin/env node --harmony
const {version} = require('../package');
const program = require('commander');
const glob = require('glob');
const concat = require('concat');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const CrcModelList = require('./crc-model-list');
const CrcModelFormatter = require('./crc-model-formatter');

let crcModelList;

/**
 * Prepend JavaScript comments to shebangs (!#) to prevent breaking the AST parser.
 *
 * @private
 * @param {string} code The source code to be parsed.
 *
 * @returns {string} The source code with shebangs commented (if any).
 */
const preprocessShebangs = (code) => {
    return code.replace('#!', '// #!');
};

/**
 * Saves `CrcModels` to file.
 *
 * @private
 * @param {array<string>} files  A list of files to be parsed.
 * @param {string} reportFilePath The filesystem location for the report.
 *
 * @returns {void}
 */
const generateReport = (files, reportFilePath) => {
    concat(files)
      .then(
        (code) => {
            crcModelList = new CrcModelList(preprocessShebangs(code));
            let template = fs.readFileSync(path.resolve(__dirname, 'templates', 'crc-card.html'));
            let formatter = new CrcModelFormatter(template);
            let report = formatter.format(crcModelList);
            saveToFile(report, reportFilePath);
        },
        (reason) => {
            console.error(reason);
        }
    ).catch((err) => {
        console.warn(err);
    });
};

/**
 * Saves a Class-Responsibility-Collaboration report to the filesystem.
 *
 * @private
 * @param {string} report   The CRC Model report.
 * @param {string} filepath The filesystem location for the report.
 *
 * @throws {Error} Throws an `Error` if the report cannot be saved.
 *
 * @returns {void}
 */
const saveToFile = (report, filepath) => {
    let buffer = new Buffer(report);

    fs.open(filepath, 'w', function(err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        }

        fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log(`Class-Responsibility-Collaborators report saved to "${filepath}."`);
            });
        });
    });
};

/**
 * A command-line interface that creates a Class-Responsibility-Collaborators report.
 */
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
