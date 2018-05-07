var science = require('./');
var tx = require('./db.json');
var leftRightCol = require('@quarterto/left-right-col');
var hr = require('@quarterto/hr');
var numeral = require('@quarterto/numeral-gb');
var nameTx = require('./lib/name-tx');

var gb = x => numeral(x).format('$0.00');

var grouped = science.group(tx, {
	payeesAlias: require('./payees.json')
});

var planned = [{payee: "hoodie", amount: -40}, {payee: "haircut", amount: -29}];


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
`);
