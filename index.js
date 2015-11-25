var tx = require('./db.json'); 
var gaussian = require('./gaussian');
var group = require('./group');
var nameGroups = require('./name-groups.js');

var groups = group(tx);
var namedGroups = nameGroups(groups);

console.log(namedGroups);
