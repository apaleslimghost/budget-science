var tx = require('./db.json'); 
var _ = require('lodash');

var grouped = _.groupBy(tx, t => t.payee.split(/\s/)[0]);
var gauss = _.mapValues(grouped, group => {
	var amts = _.pluck(group, 'amount');
	var μ = _.sum(amts) / amts.length;
	var d = _.map(amts, a => Math.pow(μ - a, 2));
	var σ = Math.sqrt(_.sum(d) / amts.length);
	return {σ, μ, n: amts.length};
});

console.log(gauss);
