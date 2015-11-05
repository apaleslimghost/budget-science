var tx = require('./db.json'); 
var _ = require('lodash');
var util = require('util');

var within_σ = (n, σ, μ) => x => (μ - n*σ) <= x && x <= (μ + n*σ);

var grouped = _.groupBy(tx, t => t.payee.split(/\W/)[0]);
var gauss = _.mapValues(grouped, group => {
	var amts = _.pluck(group, 'amount');
	var μ = _.sum(amts) / amts.length;
	var d = _.map(amts, a => Math.pow(μ - a, 2));
	var σ = Math.sqrt(_.sum(d) / amts.length);
	return {σ, μ, n: amts.length};
});

var regrouped = _.transform(grouped, (result, group, k) => {
	var p = _.partition(group, t =>
		within_σ(2, gauss[k].σ, gauss[k].μ)(t.amount)
	);
	result[k] = p[0];
	_.assign(result, _.groupBy(p[1], 'payee'));
}, {});

console.log(util.inspect(regrouped, {depth: null}));
