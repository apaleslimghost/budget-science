var tx = require('./db.json');
var _ = require('lodash');
var levenshtein = require('fast-levenshtein').get;
var util = require('util');

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

var paired = pairs(tx).map(function(ts) {
	return {
		ts: ts,
		similar: txSimilarity(ts)
	}
}).filter(t => t.similar < 1).filter(t => t.ts[0].payee !== t.ts[1].payee);

console.log(util.inspect(paired, {depth: null}));
