var prefix = require('common-prefix')
var titleCase = require('title-case');
var normaliseWhitespace = require('./normalise');

module.exports = function nameGroup(group, names) {
	if(group[0].category) return group[0].category;

	var payees = group.map(t => normaliseWhitespace(titleCase(t.payee)));
	var name = normaliseWhitespace(prefix(payees) || payees.join(', '));
	var suffixed = name;
	var i = 0;
	while(~names.indexOf(suffixed)) suffixed = name + ' (' + (++i) + ')';
	return suffixed;
};
