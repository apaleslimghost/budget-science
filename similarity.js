var levenshtein = require('fast-levenshtein').get;

module.exports = function similarity(t1, t2) {
	var amtSimilar = Math.pow(t1.amount - t2.amount, 2);
	var payeeSimilar = levenshtein(t1.payee, t2.payee) / 5;

	return Math.pow(amtSimilar + payeeSimilar, 2);
};
