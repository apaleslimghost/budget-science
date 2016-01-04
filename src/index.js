var partition = require('lodash.partition');
var flatten = require('lodash.flatten');
var defaults = require('lodash.defaults');
var sum = require('lodash.sum');
var moment = require('moment');
var groupBy = require('lodash.groupby');
var mapValues = require('lodash.mapvalues');
var computed = require('computed-decorator');

var similarity = require('./similarity');
var TransactionGroup = require('./group');
var nameGroups = require('./name-groups');

var payMonth = payday => function payMonth(date) {
	var m = moment(date);
	var paydayMoment = m.clone().date(payday);
	return (
		m.isAfter(paydayMoment) ? m.add(1, 'month') : m
	).format('YY-MM');
};

var txMonth = tx => payMonth(tx.date);

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

	constructor(groups, {payday = 0} = {}) {
		this.payday = payday;
		this.groups = groups;
		this.transactions = flatten(groups.map(g => g.transactions));
	}

	@computed('groups')
	outgoingPerMonth() {
		return sum(this.groups, group => isFinite(group.perMonth) && group.perMonth);
	}

	@computed('recurring')
	sumRecurring() {
		return sum(this.recurring().groups, 'perMonth');
	}

	@computed('groups')
	recurring() {
		return new GroupedTransactions(this.groups.filter(group => group.recurring));
	}

	@computed('groups')
	splitInOut() {
		var [incoming, outgoing] = partition(this.groups, group => group.gaussian.μ > 0);
		return {incoming, outgoing};
	}

	@computed('recurring')
	recurringInOut() {
		return this.recurring().splitInOut();
	}

	@computed('transactions', 'payday')
	byMonth() {
		return groupBy(this.transactions, txMonth(this.payday));
	}

	@computed('transactions')
	byWeek() {
		return groupBy(this.transactions, tx => moment(tx.date).startOf('week'));
	}

	@computed('byMonth')
	sumByMonth() {
		return mapValues(this.byMonth(), g => sum(g, 'amount'));
	}

	@computed('groups')
	named() {
		return nameGroups(this.groups);
	}

	@computed('groups')
	notRecurring() {
		return new GroupedTransactions(this.groups.filter(group => !group.recurring));
	}

	@computed('byMonth')
	thisMonth() {
		return this.byMonth()[payMonth(new Date())];
	}
}
