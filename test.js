var GroupedTransactions = require('./');
var tx = require('./db.json');
var sum = require('lodash.sum');
var leftRightCol = require('@quarterto/left-right-col');
var hr = require('@quarterto/hr');
var numeral = require('@quarterto/numeral-gb');
var nameTx = require('./lib/name-tx');

var sumTx = x => sum(x.transactions || x, 'amount');
var gb = x => numeral(x).format('$0.00');

var grouped = GroupedTransactions.group(tx, {
	payeesAlias: require('./payees.json')
});

var DAYS_PER_YEAR = 365 + 1/4 - 1/100 + 1/400;
var WEEKS_PER_YEAR = DAYS_PER_YEAR / 7;
var WEEKS_PER_MONTH = WEEKS_PER_YEAR / 12;

var planned = [{payee: "hoodie", amount: -40}, {payee: "haircut", amount: -29}];

var recurring = grouped.thisMonthRecurring();
var monthlyBudget = sumTx(recurring.incoming) + sumTx(recurring.outgoing) + sumTx(planned) + sumTx(grouped.notRecurring().thisMonthBeforeThisWeek());

var weeklyBudget = monthlyBudget / WEEKS_PER_MONTH + sumTx(grouped.notRecurring().thisWeek());

var displayTx = tx => leftRightCol(nameTx(tx.payee), gb(tx.amount), 50);
var listTx = txs => txs.map(displayTx).join('\n');
var thisWeekTx = () => listTx(grouped.notRecurring().thisWeek());
var thisMonthTx = () => listTx(recurring.incoming) + '\n' + listTx(recurring.outgoing);

console.log(`
${leftRightCol('This Week', gb(weeklyBudget), 50)}
${hr()}
${thisWeekTx()}

${leftRightCol('This Month', gb(monthlyBudget), 50)}
${hr()}
${thisMonthTx()}

${leftRightCol('Upcoming', gb(sumTx(planned)), 50)}
${hr()}
${listTx(planned)}
`)
