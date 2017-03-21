
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const findPackage = require('find-package');
const {name, version, repository, homepage} = findPackage(__dirname);
const {template, trim} = require('lodash');
const gitRevSync = require('git-rev-sync');
let defaultCrcTemplate  = null;

(function () {

    const fetchReposInfo = () => {
        const branch = trim(gitRevSync.branch());
        const reposUrl = repository.url.replace('.git', '');
        const short = gitRevSync.short();
        return {
            branch: branch,
            commitUrl: reposUrl + '/commit/' + short,
            short: short,
            url: reposUrl + '/tree/' + encodeURIComponent(branch)
        };
    };

    const declarators = [
        //'FunctionDeclaration',
        //'FunctionExpression',
        //'ArrowFunctionExpression',
        'ClassDeclaration',
        'ClassExpression',
        'VariableDeclaration'//,
        //'VariableDeclarator'
    ];
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
                    generator: {
                        name: 'eslint-plugin-crc',
                        url: 'https://github.com/gregswindle/eslint-plugin-crc'
                    },
                    module: {
                        homepage: homepage,
                        name: name,
                        version: version
                    },
                    publication: {
                        created: new Date().toISOString()
                    },
                    repository: fetchReposInfo()
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
            const crcModelTemplate = template(this.template);
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
