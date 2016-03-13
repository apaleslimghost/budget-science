var partition = require('lodash.partition');
var flatten = require('lodash.flatten');
var defaults = require('lodash.defaults');
var sum = require('lodash.sum');
var moment = require('moment');
var groupBy = require('lodash.groupby');
var mapValues = require('lodash.mapvalues');
var maxBy = require('lodash.maxby');

var similarity = require('./similarity');
var TransactionGroup = require('./group');
var nameGroups = require('./name-groups');

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

	constructor(groups, parent = this) {
		this.groups = groups;
		this.parent = parent;
		this.transactions = flatten(groups.map(g => g.transactions));
	}

	subgroup(groups) {
		return new GroupedTransactions(groups, this.parent || this);
	}

	outgoingPerMonth() {
		return sum(this.groups, group => isFinite(group.perMonth) && group.perMonth);
	}

	sumRecurring() {
		return sum(this.recurring().groups, 'perMonth');
	}

	recurring() {
		return this.subgroup(this.groups.filter(group => group.recurring));
	}

	splitInOut() {
		var [incoming, outgoing] = partition(this.groups, group => group.gaussian.μ > 0)
					.map(group => this.subgroup(group));
		return {incoming, outgoing};
	}

	recurringInOut() {
		return this.recurring().splitInOut();
	}

	named() {
		return nameGroups(this.groups);
	}

	notRecurring() {
		return this.subgroup(this.groups.filter(group => !group.recurring));
	}

	lastPayday() {
		var oneMonthAgo = moment().subtract(1, 'month');
		var txThisMonth = this.parent.transactions.filter(tx => !moment(tx.date).isBefore(oneMonthAgo));
		var paydayGroup = maxBy(this.parent.recurringInOut().incoming.groups, 'perMonth');
		return new Date(txThisMonth.filter(tx => paydayGroup.transactions.some(tx2 => tx2 === tx))[0].date);
	}

	thisMonth() {
		var payday = this.lastPayday();
		return this.transactions.filter(tx => !moment(tx.date).isBefore(payday));
	}

	thisMonthBeforeThisWeek() {
		var startOfWeek = moment().startOf('isoweek');
		return this.thisMonth().filter(tx => moment(tx.date).isBefore(startOfWeek));
	}

	thisWeek() {
		var startOfWeek = moment().startOf('isoweek');
		return this.transactions.filter(tx => !moment(tx.date).isBefore(startOfWeek));
	}

	thisMonthRecurring() {
		var recurring = this.recurring();
		return mapValues(this.splitInOut(), o => o
										 .thisMonth()
										 .filter(tx => recurring.transactions.some(tx2 => tx2 === tx)));
	}

	toJSON() {
		return this.groups.map(group => group.toJSON());
	}
}
