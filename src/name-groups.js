var nameGroup = require('./name-group');

module.exports = function nameGroups(groups) {
	var namedGroups = {};

	groups.forEach(group => {
		namedGroups[nameGroup(group, Object.keys(namedGroups))] = group;
	});

	return namedGroups;
}
