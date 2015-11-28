var similarity = require('./similarity');

module.exports = function group(tx, options) {
	options = options || {};
	var groups = options.groups || [];
	var threshold = options.threshold || 1;
	var skip = options.skip || [];

	tx.forEach((t1, i) => {
		if(~skip.indexOf(t1.hash)) return;
		var group = [t1];
		groups.push(group);
		var k = groups.length;

		tx.slice(i + 1).forEach(t2 => {
			if(~skip.indexOf(t2.hash)) return;
			if(similarity(t1, t2) < threshold) {
				group.push(t2);
				skip.push(t2.hash);
			}
		});
	});

	return groups;
};

