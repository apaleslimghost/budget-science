var GroupedTransactions = require('./');
var tx = require('./db.json');

var grouped = GroupedTransactions.group(tx, {
	payeesAlias: require('./payees.json')
});
console.log(Object.keys(grouped.recurring().named()));
console.log(grouped.sumRecurring());

