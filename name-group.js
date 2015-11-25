var prefix = require('common-prefix');

module.exports = function nameGroup(group, names) {
	var name = prefix(group.map(t => t.payee));
	var suffixed = name;
	var i = 0;
	while(~names.indexOf(suffixed)) suffixed = name + '-' + (++i);
	return suffixed;
};
