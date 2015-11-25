var tx = require('./db.json');
var levenshtein = require('fast-levenshtein').get;
var prefix = require('common-prefix');

function txSimilarity(ts) {
	var amtSimilar = Math.pow(ts[0].amount - ts[1].amount, 2);
	var payeeSimilar = levenshtein(ts[0].payee, ts[1].payee) / 5;

	return Math.pow(amtSimilar + payeeSimilar, 2);
}

var groups = [];
var skip = [];

tx.forEach((t1, i) => {
	if(~skip.indexOf(i)) return;
	var group = [t1];
	groups.push(group);
	var k = groups.length;

	tx.slice(i + 1).forEach((t2, j) => {
		if(~skip.indexOf(i + j + 1)) return;
		if(txSimilarity([t1, t2]) < 1) {
			group.push(t2);
			skip.push(i + j + 1);
		}
	});
});

var namedGroups = {};
groups.forEach(group => {
	var name = prefix(group.map(t => t.payee));
	var suffixed = name;
	var i = 0;
	while(suffixed in namedGroups) suffixed = name + '-' + (++i);
	namedGroups[suffixed] = group;
});

console.log(namedGroups);
