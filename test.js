var GroupedTransactions = require('./');
var tx = require('./db.json');

var grouped = GroupedTransactions.group(tx, {
	payeesAlias: require('./payees.json')
});
console.log(JSON.stringify(grouped.splitInOut().incoming.named(), null, 2));
console.log(grouped.sumRecurring());

