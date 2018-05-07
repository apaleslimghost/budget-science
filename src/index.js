var sum = require('lodash.sum');
var GroupedTransactions = require('./grouped');

var sumTx = x => sum(x.transactions || x, 'amount');

var DAYS_PER_YEAR = 365 + 1/4 - 1/100 + 1/400;
var WEEKS_PER_YEAR = DAYS_PER_YEAR / 7;
var WEEKS_PER_MONTH = WEEKS_PER_YEAR / 12;

exports.group = GroupedTransactions.group;

exports.monthlyBudget = (grouped, planned) => {
	var recurring = grouped.thisMonthRecurring();
	return sumTx(recurring.incoming) + sumTx(recurring.outgoing) + sumTx(planned) + sumTx(grouped.notRecurring().thisMonthBeforeThisWeek());
};

exports.weeklyBudget = (monthlyBudget, grouped, fudge = 0.8) => fudge * monthlyBudget / WEEKS_PER_MONTH + sumTx(grouped.notRecurring().thisWeek());

