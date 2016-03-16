var normaliseWhitespace = require('./normalise');
var titleCase = require('title-case');

module.exports = n => titleCase(normaliseWhitespace(n));
