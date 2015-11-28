var tx = require('./db.json'); 
var gaussian = require('./gaussian');
var group = require('./group');
var nameGroups = require('./name-groups');
var nameGroup = require('./name-group');
var sortBy = require('lodash.sortby');
var pairs = xs => xs.length < 2 ? [] : [xs.slice(0, 2)].concat(pairs(xs.slice(1)));
var sum = require('lodash.sum');
var flatten = require('lodash.flatten');
var moment = require('moment');
var fs = require('fs');

var MONTH_MS = (365.2425 / 12) * 24 * 60 * 60 * 1000;

function groupMeta(fn) {
	return g => {
		g[fn.name] = fn(g)
		return g;
	};
}

var lastTxDate = moment(Math.max.apply(null, tx.map(t => new Date(t.date))));
var sixMonthsAgo = lastTxDate.clone().subtract(6, 'months');

console.log(lastTxDate.toDate(), sixMonthsAgo.toDate());

var existingGroups = [];
try {
	existingGroups = require('./groups.json');
} catch(e) {}

var payeesAlias = {};
try {
	payeesAlias = require('./payees.json');
} catch(e) {}

var groups = group(tx, {
	threshold: 5,
	groups: existingGroups,
	skip:   flatten(existingGroups.map(g => g.map(t => t.hash))),
	payeesAlias: payeesAlias
})
.map(groupMeta(function gauss(g) {
	return gaussian(g.map(t => t.amount));
}))
.map(groupMeta(function timeGauss(g) {
	if(g.length <= 2) return {};
	return gaussian(pairs(sortBy(g, t => new Date(t.date))).map(p => {
		return new Date(p[1].date) - new Date(p[0].date);
	}));
}))
.map(groupMeta(function recurring(g) {
	var expectedIn6Months = 6 * MONTH_MS / g.timeGauss.μ;
	var actualIn6Months = g.filter(t => moment(t.date).isAfter(sixMonthsAgo)).length;

	return g.length > 2
	    && g.timeGauss.σ < g.timeGauss.μ / 10
	    && Math.pow(1 - actualIn6Months / expectedIn6Months, 2) < 0.1;
}))
.map(groupMeta(function perMonth(g) {
	return MONTH_MS * g.gauss.μ / g.timeGauss.μ;
}));

console.log(nameGroups(groups));
console.log(sum(groups.filter(g => g.recurring), 'perMonth'));

fs.writeFile('groups.json', JSON.stringify(groups, null, 2), 'utf8');
