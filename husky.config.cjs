// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
module.exports = require('husky-config-airlight');
// Our alpha linter
module.exports.hooks['pre-push'] = 'smartlint';
