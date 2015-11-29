var GroupedTransactions = require('./');
var tx = require('./db.json');

var grouped = new GroupedTransactions(tx);
console.log(grouped.recurringInOut());
