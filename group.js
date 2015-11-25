var similarity = require('./similarity');

module.exports = function group(tx, groups) {
	groups = groups || [];
	var skip = [];

	tx.forEach((t1, i) => {
		if(~skip.indexOf(i)) return;
		var group = [t1];
		groups.push(group);
		var k = groups.length;

		tx.slice(i + 1).forEach((t2, j) => {
			if(~skip.indexOf(i + j + 1)) return;
			if(similarity(t1, t2) < 1) {
				group.push(t2);
				skip.push(i + j + 1);
			}
		});
	});

	return groups;
};

