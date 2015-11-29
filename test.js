var GroupedTransactions = require('./');
var tx = require('./db.json');
var sum = require('lodash.sum');

var grouped = GroupedTransactions.group(tx);
console.log(sum(grouped.transactions, 'amount'));
