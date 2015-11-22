var tx = require('./db.json').slice(0, 1000);
var _ = require('lodash');
var levenshtein = require('fast-levenshtein').get;
var util = require('util');
var springy = require('springy');

var graph = new springy.Graph();
tx.forEach(t => graph.addNode(new springy.Node(t.date, {tx: t})));

function txSimilarity(ts) {
	var amtSimilar = Math.pow(ts[0].amount - ts[1].amount, 2);
	var payeeSimilar = levenshtein(ts[0].payee, ts[1].payee) / 5;

	return Math.pow(amtSimilar + payeeSimilar, 2);
}

function pairWith(x, ys) {
	return ys.map(y => [x, y]);
}

function pairs(xs) {
	if(xs.length === 0) return [];
	return pairWith(xs[0], xs.slice(1)).concat(pairs(xs.slice(1)));
}

pairs(tx).map(function(ts) {
	return {
		ts: ts,
		similar: txSimilarity(ts)
	}
}).forEach(p => {
	if(p.similar > 10) return;
	graph.newEdge(
		graph.nodeSet[p.ts[0].date],
		graph.nodeSet[p.ts[1].date],
		{length: p.similar}
	);
});

var layout = new springy.Layout.ForceDirected(graph, 400, 400, 0.5, 1e-6);

var iter = 1000;

layout.start(function tick() {
	console.log(iter);
	if(!--iter) layout.stop();
}, function onStop() {
	layout.eachEdge((edge, spring) => {
		var d = Math.sqrt(Math.pow(spring.point1.p.x - spring.point2.p.x, 2) + Math.pow(spring.point1.p.y - spring.point2.p.y, 2));
		if(d < 2) {
			console.log(edge.source.data.tx, edge.target.data.tx)
		}
	});
});

