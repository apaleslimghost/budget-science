var prefix = require('common-prefix')
var titleCase = require('title-case');

var normaliseWhitespace = s => s.replace(/\s+/g, ' ').trim();

module.exports = function nameGroup(group, names) {
	var payees = group.map(t => normaliseWhitespace(titleCase(t.payee)));
	var name = normaliseWhitespace(prefix(payees) || payees.join(', '));
	var suffixed = name;
	var i = 0;
	while(~names.indexOf(suffixed)) suffixed = name + ' (' + (++i) + ')';
	return suffixed;
};
