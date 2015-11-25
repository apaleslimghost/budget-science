var sum = require('lodash.sum');

module.exports = function gaussian(ns) {
	var n = ns.length;
	var μ = sum(ns) / n;
	var d = ns.map(a => Math.pow(μ - a, 2));
	var σ = Math.sqrt(sum(d) / n);
	return {σ, μ, n};
};
