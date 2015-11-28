var tx = require('./db.json'); 
var gaussian = require('./gaussian');
var group = require('./group');
var nameGroups = require('./name-groups');
var sortBy = require('lodash.sortby');
var pairs = xs => xs.length < 2 ? [] : [xs.slice(0, 2)].concat(pairs(xs.slice(1)));
var sum = require('lodash.sum');
var flatten = require('lodash.flatten');
var fs = require('fs');

var MONTH_MS = (365.2425 / 12) * 24 * 60 * 60 * 1000;

function groupMeta(fn) {
	return g => {
		g[fn.name] = fn(g)
		return g;
	};
}

var existingGroups = [];

try {
	existingGroups = require('./groups.json');
} catch(e) {}

var groups = group(tx, {
	threshold: 5,
	groups: existingGroups,
	skip:   flatten(existingGroups.map(g => g.map(t => t.hash)))
})
.map(groupMeta(function gauss(g) {
	return gaussian(g.map(t => t.amount));
}))
.map(groupMeta(function timeGauss(g) {
	if(g.length <= 2) return;
	return gaussian(pairs(sortBy(g, t => new Date(t.date))).map(p => {
		return new Date(p[1].date) - new Date(p[0].date);
	}));
}));

var recurring = groups
.filter(g => g.length > 2 && g.timeGauss.σ < g.timeGauss.μ / 10)
.map(groupMeta(function perMonth(g) {
	return MONTH_MS * g.gauss.μ / g.timeGauss.μ;
}));

fs.writeFile('groups.json', JSON.stringify(groups), 'utf8');
