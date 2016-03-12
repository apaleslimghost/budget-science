var levenshtein = require('fast-levenshtein').get;
var defaults = require('lodash.defaults');
var includes = require('lodash.includes');

var normaliseWhitespace = require('./normalise');

var absMax = (a, b) => (Math.abs(a) > Math.abs(b)) ? a : b;
var aliased = (n1, n2, aliases) => aliases.some(alias => includes(alias, n1) && includes(alias, n2));

module.exports = function similarity(t1, t2, options) {
	var {payeeWeight, amountWeight, payeesAlias} = defaults(options, {
		payeeWeight:  3,
		amountWeight: 1,
		payeesAlias:  []
	});

	var amtSimilar = Math.pow((t1.amount - t2.amount) / absMax(t1.amount, t2.amount), 2) / amountWeight;
	var payeeSimilar = levenshtein(t1.payee, t2.payee) / payeeWeight;

	if(aliased(normaliseWhitespace(t1.payee), normaliseWhitespace(t2.payee), options.payeesAlias)) {
		payeeSimilar = 0;
	}

	return Math.pow(amtSimilar + payeeSimilar, 2);
};
