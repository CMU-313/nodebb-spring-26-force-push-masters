'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const User = require('../src/user');
const groups = require('../src/groups');
const apiTopics = require('../src/api/topics');

describe('Topic resolution', () => {
	let adminUid;
	let fooUid;
	let categoryObj;
	let newTopicTid;

	before(async () => {
		adminUid = await User.create({ username: 'resAdmin', password: '123456' });
		fooUid = await User.create({ username: 'resFoo', password: '123456' });
		await groups.join('administrators', adminUid);

		categoryObj = await categories.create({
			name: 'Resolution Test Category',
			description: 'For topic resolution tests',
		});

		const result = await topics.post({
			uid: fooUid,
			title: 'Topic to resolve',
			content: 'Content.',
			cid: categoryObj.cid,
		});
		newTopicTid = result.topicData.tid;
	});

	it('should reject resolve when caller is not admin or mod', async () => {
		try {
			await apiTopics.resolve({ uid: fooUid }, { tids: [newTopicTid], cid: categoryObj.cid });
			assert.fail('expected no-privileges error');
		} catch (err) {
			assert.strictEqual(err.message, '[[error:no-privileges]]');
		}
	});

	it('should add tid to cid:X:tids:resolved when topic is resolved', async () => {
		await apiTopics.resolve({ uid: adminUid }, { tids: [newTopicTid], cid: categoryObj.cid });
		const inSet = await db.isSortedSetMember(`cid:${categoryObj.cid}:tids:resolved`, newTopicTid);
		assert(inSet, 'resolved topic should be in cid:X:tids:resolved');
		await apiTopics.unresolve({ uid: adminUid }, { tids: [newTopicTid], cid: categoryObj.cid });
	});

	it('should return only resolved topics when category filter resolved=1', async () => {
		await apiTopics.resolve({ uid: adminUid }, { tids: [newTopicTid], cid: categoryObj.cid });
		const otherResult = await topics.post({
			uid: adminUid,
			title: 'Unresolved topic',
			content: 'Other content.',
			cid: categoryObj.cid,
		});
		const otherTid = otherResult.topicData.tid;
		const data = {
			cid: categoryObj.cid,
			uid: adminUid,
			start: 0,
			stop: 10,
			sort: 'recently_replied',
			resolved: '1',
			category: categoryObj,
		};
		const tids = await categories.getTopicIds(data);
		const tidSet = new Set(tids.map(t => String(t)));
		assert(tidSet.has(String(newTopicTid)), 'resolved topic should be in result');
		assert(!tidSet.has(String(otherTid)), 'unresolved topic should not be in result');
		await apiTopics.unresolve({ uid: adminUid }, { tids: [newTopicTid], cid: categoryObj.cid });
	});

});
