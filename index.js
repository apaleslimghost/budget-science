var tx = require('./db.json'); 
var gaussian = require('./gaussian');
var group = require('./group');
var nameGroups = require('./name-groups');
var sortBy = require('lodash.sortby');
var moment = require('moment');
var pairs = xs => xs.length < 2 ? [] : [xs.slice(0, 2)].concat(pairs(xs.slice(1)));

function groupMeta(fn) {
	return g => {
		g[fn.name] = fn(g)
		return g;
	};
}

var groups = group(tx, {threshold: 2})
.map(groupMeta(function gauss(g) {
	return gaussian(g.map(t => t.amount));
}))
.map(groupMeta(function timeGauss(g) {
	if(g.length === 1) return;
	return gaussian(pairs(sortBy(g, t => new Date(t.date))).map(p => {
		return new Date(p[1].date) - new Date(p[0].date);
	}));
}));

var recurring = groups.filter(g => g.length > 2 && g.timeGauss.σ < g.timeGauss.μ / 10).map(g => {
	g.timeGauss.σ = moment.duration(g.timeGauss.σ).humanize();
	g.timeGauss.μ = moment.duration(g.timeGauss.μ).humanize();
	return g;
});

console.log(nameGroups(recurring));
