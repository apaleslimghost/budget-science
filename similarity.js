var levenshtein = require('fast-levenshtein').get;

module.exports = function similarity(t1, t2, options) {
	options = options || {};
	var payeeWeight  = options.payeeWeight  || 3;
	var amountWeight = options.amountWeight || 1;
	var amtSimilar = Math.pow(t1.amount - t2.amount, 2) / amountWeight;
	var payeeSimilar = levenshtein(t1.payee, t2.payee) / payeeWeight;

	return Math.pow(amtSimilar + payeeSimilar, 2);
};
