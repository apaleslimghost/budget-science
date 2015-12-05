var partition = require('lodash.partition');
var flatten = require('lodash.flatten');
var defaults = require('lodash.defaults');
var sum = require('lodash.sum');
var moment = require('moment');
var groupBy = require('lodash.groupby');
var mapValues = require('lodash.mapvalues');

var similarity = require('./similarity');
var TransactionGroup = require('./group');
var nameGroups = require('./name-groups');

var txMonth = payday => function txMonth(tx) {
	var m = moment(tx.date);
	var twentySeventh = m.clone().date(payday);
	return (
		m.isAfter(twentySeventh) ? m.add(1, 'month') : m
	).format('YY-MM');
};

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
			if(~skip.indexOf(t1.hash || t1._id)) return;
			var group = new TransactionGroup([t1]);
			groups.push(group);

			tx.slice(i + 1).forEach(t2 => {
				if(~skip.indexOf(t2.hash || t2._id)) return;
				if(similarity(t1, t2, options) < threshold) {
					group.add(t2);
					skip.push(t2.hash || t2._id);
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
			return isFinite(group.perMonth) && group.perMonth
		});
	}

	sumRecurring() {
		return sum(this.recurring().groups, 'perMonth');
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

	byMonth(payday = 0) {
		return groupBy(this.transactions, txMonth(payday));
	}

	sumByMonth(payday = 0) {
		return mapValues(this.byMonth(payday), g => sum(g, 'amount'));
	}

	named() {
		return nameGroups(this.groups);
	}
}
