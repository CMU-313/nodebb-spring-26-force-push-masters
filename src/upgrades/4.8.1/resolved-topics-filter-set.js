'use strict';

const db = require('../../database');
const batch = require('../../batch');

module.exports = {
	name: 'Backfill cid:X:tids:resolved for existing resolved topics',
	timestamp: Date.UTC(2026, 1, 7),
	method: async function () {
		const { progress } = this;

		const topicCount = await db.sortedSetCard('topics:tid');
		progress.total = topicCount;

		await batch.processSortedSet('topics:tid', async (tids) => {
			const topicData = await db.getObjectsFields(
				tids.map(tid => `topic:${tid}`),
				['tid', 'cid', 'resolved']
			);

			const toAdd = [];
			topicData.forEach((topic) => {
				if (topic && parseInt(topic.resolved, 10) === 1 && topic.cid) {
					toAdd.push([`cid:${topic.cid}:tids:resolved`, 1, topic.tid]);
				}
			});

			if (toAdd.length) {
				await db.sortedSetAddBulk(toAdd);
			}

			progress.incr(tids.length);
		}, {
			batch: 500,
		});
	},
};
