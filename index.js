var tx = require('./db.json'); 
var gaussian = require('./gaussian');
var group = require('./group');
var nameGroups = require('./name-groups');

var groups = group(tx, {threshold: 5}).map(g => {
	g.gaussian = gaussian(g.map(t => t.amount));
	return g;
});
var namedGroups = nameGroups(groups);

console.log(namedGroups);
