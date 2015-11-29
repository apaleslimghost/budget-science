var partition = require('lodash.partition');
var flatten = require('lodash.flatten');
var defaults = require('lodash.defaults');
var sum = require('lodash.sum');

var similarity = require('./similarity');
var TransactionGroup = require('./group');

module.exports = class GroupedTransactions {
	constructor(tx, options = {}) {
		var {skip, threshold} = defaults(options, {
			groups: [],
			get skip() {
				return flatten(options.groups.map(g => g.transactions.map(t => t.hash)));
			},
			threshold: 1,
		});

		this.groups = options.groups.map(TransactionGroup.from);

		tx.forEach((t1, i) => {
			if(~skip.indexOf(t1.hash)) return;
			var group = new TransactionGroup([t1]);
			this.groups.push(group);

			tx.slice(i + 1).forEach(t2 => {
				if(~skip.indexOf(t2.hash)) return;
				if(similarity(t1, t2, options) < threshold) {
					group.add(t2);
					skip.push(t2.hash);
				}
			});
		});
	}

	sumRecurring() {
		return sum(this.recurring(), 'perMonth');
	}

	recurring() {
		return this.groups.filter(group => group.recurring);
	}

	recurringInOut() {
		var [incoming, outgoing] = partition(this.recurring(), group => group.perMonth > 0);
		return {incoming, outgoing};
	}
}
