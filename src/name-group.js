var prefix = require('common-prefix');
var nameTx = require('./name-tx');

module.exports = function nameGroup(group, names = []) {
	var payees = group.transactions.map(t => nameTx(t.payee));
	var name = prefix(payees) || payees.join(', ');
	var suffixed = name;
	var i = 0;
	while(~names.indexOf(suffixed)) suffixed = name + ' (' + (++i) + ')';
	return suffixed;
};
