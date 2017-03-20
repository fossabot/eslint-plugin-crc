
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const {name, version, repository} = require('../package');
let defaultCrcTemplate  = null;

(function (){
    /**
     * Transforms one or more `CrcModel` objects into  human-readable,
     * HTML- and markdown-friendly tables, aka "cards".
     */
    class CrcModelFormatter {

        /**
         * Constructor - Creates a `CrcModelFormatter` object.
         *
         * @param {string} template A lodash-compliant template string.
         *
         * @returns {CrcModelFormatter} A `CrcModelFormatter` object.
         */
        constructor(template = defaultCrcTemplate) {
            this.template = template;
            this.data = {
                crcModelList: [],
                meta: {
                    publication: {
                        created: {
                            localeFormat: moment().format('dddd, MMMM Do YYYY, h:mm:ss a'),
                            isoString: moment().toISOString()
                        }
                    },
                    generator: {
                        name: name,
                        version: version,
                        url: repository.url
                    }
                }
            };
        }

        /**
         * Format - Generaters CRC Model "cards" out of a list of `CrcModels`.
         *
         * @param {CrcModel[]} crcModelList An array of `CrcModel` objects.
         *
         * @requires [lodash#template](https://lodash.com/docs/4.17.4#template)
         *
         * @returns {string} HTML of human-readable CRC Models.
         */
        format(crcModelList) {
            const crcModelTemplate = _.template(this.template);
            this.data.crcModelList = crcModelList;
            return crcModelTemplate(this.data);
        }
  }

    (function loadDefaultTemplate() {
        let templatePath = path.resolve(__dirname, 'templates', 'crc-card.html');
        fs.readFile(templatePath, 'utf8', function(err, html) {
            /* istanbul ignore next */
            if (err) {
                throw err;
            }
            defaultCrcTemplate = html;
        });
    }());

    module.exports = CrcModelFormatter;

}());
