'use strict';

const assert = require('assert');

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const User = require('../src/user');
const groups = require('../src/groups');
const apiTopics = require('../src/api/topics');
const { assignRoleToUser } = require('../src/user/roles');

describe('Instructor-only topics', () => {
	let studentUid;
	let taUid;
	let professorUid;
	let adminUid;
	let categoryObj;
	let instructorTid;
	let normalTid;

	before(async () => {
		studentUid = await User.create({ username: 'itStudent', password: '123456' });
		taUid = await User.create({ username: 'itTA', password: '123456' });
		professorUid = await User.create({ username: 'itProfessor', password: '123456' });
		adminUid = await User.create({ username: 'itAdmin', password: '123456' });

		await assignRoleToUser(studentUid, 'student');
		await assignRoleToUser(taUid, 'ta');
		await assignRoleToUser(professorUid, 'professor');
		await groups.join('administrators', adminUid);

		categoryObj = await categories.create({
			name: 'Instructor Topics Test',
			description: 'Category for instructor topic tests',
		});

		// Create a normal topic visible to everyone
		const normalResult = await topics.post({
			uid: professorUid,
			cid: categoryObj.cid,
			title: 'Normal Topic',
			content: 'Visible to all',
		});
		normalTid = normalResult.topicData.tid;

		// Create an instructor-only topic via API (uses targetRole enforcement)
		const caller = { uid: professorUid, ip: '127.0.0.1' };
		const instructorResult = await apiTopics.create(caller, {
			cid: categoryObj.cid,
			title: 'Instructor Only Topic',
			content: 'Visible to TAs and Professors only',
			targetRole: 'ta',
		});
		instructorTid = instructorResult.tid;
	});

	describe('targetRole stored on topic creation', () => {
		it('should store targetRole on the topic hash', async () => {
			const topicData = await topics.getTopicData(instructorTid);
			assert.strictEqual(topicData.targetRole, 'ta', 'targetRole should be stored on the topic');
		});

		it('should add the tid to cid:X:tids:instructor sorted set', async () => {
			const inSet = await db.isSortedSetMember(`cid:${categoryObj.cid}:tids:instructor`, instructorTid);
			assert(inSet, 'instructor topic should be in cid:X:tids:instructor sorted set');
		});

		it('should NOT add normal topic tid to cid:X:tids:instructor sorted set', async () => {
			const inSet = await db.isSortedSetMember(`cid:${categoryObj.cid}:tids:instructor`, normalTid);
			assert(!inSet, 'normal topic should not be in cid:X:tids:instructor sorted set');
		});
	});

	describe('category topic list visibility', () => {
		const getTopicsForUser = uid => categories.getCategoryTopics({
			cid: categoryObj.cid,
			uid,
			start: 0,
			stop: 19,
			sort: 'recently_replied',
		});

		it('should hide instructor-only topics from students', async () => {
			const result = await getTopicsForUser(studentUid);
			const tids = result.topics.map(t => t.tid);
			assert(!tids.includes(instructorTid), 'student should not see instructor-only topic');
			assert(tids.includes(normalTid), 'student should see normal topic');
		});

		it('should show instructor-only topics to TAs', async () => {
			const result = await getTopicsForUser(taUid);
			const tids = result.topics.map(t => t.tid);
			assert(tids.includes(instructorTid), 'TA should see instructor-only topic');
		});

		it('should show instructor-only topics to professors', async () => {
			const result = await getTopicsForUser(professorUid);
			const tids = result.topics.map(t => t.tid);
			assert(tids.includes(instructorTid), 'professor should see instructor-only topic');
		});

		it('should show instructor-only topics to admins', async () => {
			const result = await getTopicsForUser(adminUid);
			const tids = result.topics.map(t => t.tid);
			assert(tids.includes(instructorTid), 'admin should see instructor-only topic');
		});

		it('should include targetRole field on topics returned to instructors', async () => {
			const result = await getTopicsForUser(taUid);
			const topic = result.topics.find(t => t.tid === instructorTid);
			assert(topic, 'instructor topic should be present');
			assert.strictEqual(topic.targetRole, 'ta', 'targetRole should be present on the topic object');
		});
	});

	describe('instructor filter (cid:X:tids:instructor sorted set)', () => {
		it('should return only instructor topics when instructor=1 filter is applied', async () => {
			const tids = await categories.getTopicIds({
				cid: categoryObj.cid,
				uid: taUid,
				start: 0,
				stop: 19,
				sort: 'recently_replied',
				instructor: '1',
			});
			const tidSet = new Set(tids.map(t => String(t)));
			assert(tidSet.has(String(instructorTid)), 'instructor topic should appear with instructor filter');
			assert(!tidSet.has(String(normalTid)), 'normal topic should not appear with instructor filter');
		});

		it('should return all topics when no instructor filter is applied', async () => {
			const tids = await categories.getTopicIds({
				cid: categoryObj.cid,
				uid: taUid,
				start: 0,
				stop: 19,
				sort: 'recently_replied',
			});
			const tidSet = new Set(tids.map(t => String(t)));
			assert(tidSet.has(String(instructorTid)), 'instructor topic should appear without filter');
			assert(tidSet.has(String(normalTid)), 'normal topic should appear without filter');
		});
	});

	describe('student cannot create instructor-only topics via API', () => {
		it('should strip targetRole when a student creates a topic via API', async () => {
			const caller = { uid: studentUid, ip: '127.0.0.1' };
			const result = await apiTopics.create(caller, {
				cid: categoryObj.cid,
				title: 'Student topic with targetRole attempt',
				content: 'Student content',
				targetRole: 'ta',
			});
			const tid = result.tid;
			const topicData = await topics.getTopicData(tid);
			assert(!topicData.targetRole, 'targetRole should be stripped for student-created topics');
			const inSet = await db.isSortedSetMember(`cid:${categoryObj.cid}:tids:instructor`, tid);
			assert(!inSet, 'student topic should not appear in instructor sorted set');
		});
	});
});
