var partition = require('lodash.partition');
var flatten = require('lodash.flatten');
var defaults = require('lodash.defaults');
var sum = require('lodash.sum');
var moment = require('moment');
var groupBy = require('lodash.groupby');
var mapValues = require('lodash.mapvalues');

var similarity = require('./similarity');
var TransactionGroup = require('./group');

module.exports = class GroupedTransactions {
	static group(tx, options = {}) {
		var {skip, threshold} = defaults(options, {
			groups: [],
			get skip() {
				return flatten(options.groups.map(g => g.transactions.map(t => t.hash)));
			},
			threshold: 1,
		});

		var groups = options.groups.map(TransactionGroup.from);

		tx.forEach((t1, i) => {
			if(~skip.indexOf(t1.hash)) return;
			var group = new TransactionGroup([t1]);
			groups.push(group);

			tx.slice(i + 1).forEach(t2 => {
				if(~skip.indexOf(t2.hash)) return;
				if(similarity(t1, t2, options) < threshold) {
					group.add(t2);
					skip.push(t2.hash);
				}
			});
		});

		return new GroupedTransactions(groups);
	}

	constructor(groups) {
		this.groups = groups;
		this.transactions = flatten(groups.map(g => g.transactions));
	}

	outgoingPerMonth() {
		return sum(this.groups, group => {
			console.log(group.transactions[0].payee, group.gaussian, group.perMonth);
			return isFinite(group.perMonth) && group.perMonth
		});
	}

	sumRecurring() {
		return sum(this.recurring(), 'perMonth');
	}

	recurring() {
		return new GroupedTransactions(this.groups.filter(group => group.recurring));
	}

	splitInOut() {
		var [incoming, outgoing] = partition(this.groups, group => group.gaussian.μ > 0);
		return {incoming, outgoing};
	}

	recurringInOut() {
		return this.recurring().splitInOut();
	}

	byMonth() {
		return groupBy(this.transactions, t => moment(t.date).format('YY-MM'));
	}

	sumByMonth() {
		return mapValues(this.byMonth(), g => sum(g, 'amount'));
	}
}
