var levenshtein = require('fast-levenshtein').get;

var absMax = (a, b) => (Math.abs(a) > Math.abs(b)) ? a : b;

module.exports = function similarity(t1, t2, options) {
	options = options || {};
	var payeeWeight  = options.payeeWeight  || 3;
	var amountWeight = options.amountWeight || 1;

	if(t1.category && t1.category === t2.category) return 0;

	var amtSimilar = Math.pow((t1.amount - t2.amount) / absMax(t1.amount, t2.amount), 2) / amountWeight;
	var payeeSimilar = levenshtein(t1.payee, t2.payee) / payeeWeight;

	return Math.pow(amtSimilar + payeeSimilar, 2);
};
