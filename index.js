var tx = require('./db.json'); 
var _ = require('lodash');

console.log(_.groupBy(tx, t => t.payee.split(/\W/)[0]));

