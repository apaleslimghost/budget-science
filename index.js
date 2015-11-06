var tx = require('./db.json'); 
var _ = require('lodash');
var util = require('util');
var moment = require('moment');

var start = _.min(_.map(tx, t => new Date(t.date)));
var end   = new Date();;

var startWeek = moment(start).startOf('week');
var endWeek   = moment(end).add(1, 'week').startOf('week');

var zeroes = {};
for(var week = startWeek; week.isBefore(endWeek); week = week.add(1, 'week')) {
	zeroes[week.toString()] = 0;
}

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

var counts = _.mapValues(regrouped, group => {
	return _.defaults(_.countBy(group, t => moment(t.date).startOf('week')), zeroes);
});

var fish = _.mapValues(counts, group => {
	return _.countBy(group);
});

console.log(util.inspect(fish, {depth: null}));
