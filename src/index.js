var tx = require('../db.json'); 
var Group = require('./group');
var sum = require('lodash.sum');
var flatten = require('lodash.flatten');
var fs = require('fs');

var existingGroups = [];
try {
	existingGroups = require('../groups.json');
} catch(e) {}

var payeesAlias = {};
try {
	payeesAlias = require('../payees.json');
} catch(e) {}

var groups = Group.groupTransactions(tx, {
	groups: existingGroups,
	payeesAlias: payeesAlias
});

console.log(sum(groups.filter(g => g.recurring), 'perMonth'));

fs.writeFile('groups.json', JSON.stringify(groups, null, 2), 'utf8');
