module.exports = require('husky-config-airlight');
// Our alpha linter
module.exports.hooks['pre-push'] = 'smartlint';
