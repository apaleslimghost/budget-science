var GroupedTransactions = require('./');
var tx = require('./db.json');
var sum = require('lodash.sum');
var sumTx = x => sum(x.transactions || x, 'amount');

var grouped = GroupedTransactions.group(tx, {
	payeesAlias: require('./payees.json')
});

var DAYS_PER_YEAR = 365 + 1/4 - 1/100 + 1/400;
var WEEKS_PER_YEAR = DAYS_PER_YEAR / 7;
var WEEKS_PER_MONTH = WEEKS_PER_YEAR / 12;

var planned = [{name: "hoodie", amount: -40}, {name: "haircut", amount: -29}];

var recurring = grouped.thisMonthRecurring();
var monthlyBudget = sumTx(recurring.incoming) + sumTx(recurring.outgoing) + sumTx(planned) + sumTx(grouped.notRecurring().thisMonthBeforeThisWeek());

console.log(monthlyBudget);

var weeklyBudget = monthlyBudget / WEEKS_PER_MONTH + sumTx(grouped.notRecurring().thisWeek());

console.log(weeklyBudget);

console.log(grouped.notRecurring().thisMonthBeforeThisWeek());
console.log(grouped.notRecurring().thisWeek());
console.log(grouped.thisMonthRecurring());
// console.log('nonrecurring this month before this week:', sum(grouped.notRecurring().thisMonthBeforeThisWeek(), 'amount'));
// console.log('nonrecurring this week:', sum(grouped.notRecurring().thisWeek(), 'amount'));
// console.log('recurring', grouped.sumRecurring());
