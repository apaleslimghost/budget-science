var tx = require('./db.json');
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
		{length: p.similar * 10}
	);
});

var layout = new springy.Layout.ForceDirected(graph, 400, 400, 0.5, 1e-6);

var canvas = document.createElement('canvas');
canvas.width = canvas.height = 1000;
canvas.style.width = canvas.style.height = '500px';
document.body.appendChild(canvas);

var ctx = canvas.getContext('2d');

layout.start(function tick() {
	ctx.clearRect(0, 0, 1000, 1000);
	layout.eachEdge((edge, spring) => {
		ctx.beginPath();
		ctx.moveTo(spring.point1.p.x + 500, spring.point1.p.y + 500);
		ctx.lineTo(spring.point2.p.x + 500, spring.point2.p.y + 500);
		ctx.strokeWidth = 2;
		ctx.strokeStyle = 'red';
		ctx.stroke();
	});
	layout.eachNode((node, p) => {
		ctx.fillRect(p.p.x + 500, p.p.y + 500, 2, 2);
	});
});

