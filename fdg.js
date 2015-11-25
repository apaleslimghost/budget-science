var tx = require('./db.json');
var _ = require('lodash');
var levenshtein = require('fast-levenshtein').get;
var util = require('util');
var springy = require('springy');

function txSimilarity(ts) {
	var amtSimilar = Math.pow(ts[0].amount - ts[1].amount, 2);
	var payeeSimilar = levenshtein(ts[0].payee, ts[1].payee) / 5;

	return Math.pow(amtSimilar + payeeSimilar, 2);
}

function pairWith(x, ys) {
	return ys.map(y => [x, y]);
}

function pairs(xs) {
	if(xs.length === 0) return [];
	return pairWith(xs[0], xs.slice(1)).concat(pairs(xs.slice(1)));
}

var similar = pairs(tx).map(function(ts) {
	return {
		ts: ts,
		similar: txSimilarity(ts)
	}
});

var groups = [];

similar.forEach((pair, i) => {
	console.log(i + '/' + similar.length);
	for(var i = 0, l = groups.length; i < l; i++) {
		var group = groups[i];
		if(pair.similar < 2) {
			if(~group.indexOf(pair.ts[0])) {
				group.push(pair.ts[1]);
				return;
			}

			if(~group.indexOf(pair.ts[1])) {
				group.push(pair.ts[0]);
				return;
			}

			groups.push(pair.ts);
			return;
		}
	}

	groups.push([pair.ts[0]]);
});

groups.forEach(console.log);
