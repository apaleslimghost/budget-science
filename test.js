var GroupedTransactions = require('./');
var tx = require('./db.json');
var sum = require('lodash.sum');

var grouped = GroupedTransactions.group(tx);
var sums = grouped.sumByMonth(27);

var sorted = {};
Object.keys(sums).sort().forEach(k => sorted[k] = sums[k]);

console.log(sorted);
