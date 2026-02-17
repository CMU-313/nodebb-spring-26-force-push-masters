'use strict';

const assert = require('assert');

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const privileges = require('../src/privileges');
const User = require('../src/user');
const groups = require('../src/groups');
const apiTopics = require('../src/api/topics');
const { assignRoleToUser } = require('../src/user/roles');

describe('Post Visibility by Role', () => {
	let studentUid;
	let taUid;
	let professorUid;
	let adminUid;
	let categoryObj;
	let topicData;
	let tid;
	let normalPid;
	let restrictedPid;

	before(async () => {
		studentUid = await User.create({ username: 'rvStudent', password: '123456' });
		taUid = await User.create({ username: 'rvTA', password: '123456' });
		professorUid = await User.create({ username: 'rvProfessor', password: '123456' });
		adminUid = await User.create({ username: 'rvAdmin', password: '123456' });

		await assignRoleToUser(studentUid, 'student');
		await assignRoleToUser(taUid, 'ta');
		await assignRoleToUser(professorUid, 'professor');
		await groups.join('administrators', adminUid);

		categoryObj = await categories.create({
			name: 'Role Visibility Test',
			description: 'Category for role visibility tests',
		});

		const result = await topics.post({
			uid: professorUid,
			cid: categoryObj.cid,
			title: 'Role Visibility Topic',
			content: 'Main post visible to all',
		});
		topicData = result.topicData;
		tid = topicData.tid;

		// Create a normal reply (visible to everyone)
		const normalReply = await topics.reply({
			uid: professorUid,
			tid: tid,
			content: 'Normal reply for everyone',
		});
		normalPid = normalReply.pid;

		// Create a restricted reply (instructors only)
		const restrictedReply = await topics.reply({
			uid: professorUid,
			tid: tid,
			content: 'Instructor only reply',
			targetRole: 'ta',
		});
		restrictedPid = restrictedReply.pid;
	});

	describe('targetRole on post creation', () => {
		it('should persist targetRole when created by an instructor', async () => {
			const postObj = await posts.getPostData(restrictedPid);
			assert.strictEqual(postObj.targetRole, 'ta');
		});

		it('should strip targetRole when a student tries to set it via API', async () => {
			const caller = { uid: studentUid, ip: '127.0.0.1' };
			const postData = await apiTopics.reply(caller, {
				tid: tid,
				content: 'Student trying to set targetRole',
				targetRole: 'ta',
			});
			const postObj = await posts.getPostData(postData.pid);
			assert(!postObj.targetRole, 'targetRole should be stripped for students');
		});

		it('should allow admin to set targetRole via API', async () => {
			const caller = { uid: adminUid, ip: '127.0.0.1' };
			const postData = await apiTopics.reply(caller, {
				tid: tid,
				content: 'Admin setting targetRole',
				targetRole: 'ta',
			});
			const postObj = await posts.getPostData(postData.pid);
			assert.strictEqual(postObj.targetRole, 'ta');
		});
	});

	describe('topic page filtering', () => {
		it('should hide targetRole posts from students on topic page', async () => {
			const topicObj = await topics.getTopicData(tid);
			const postsData = await topics.getTopicPosts(topicObj, `tid:${tid}:posts`, 0, -1, studentUid, false);
			const pids = postsData.map(p => p.pid);
			assert(!pids.includes(restrictedPid), 'Student should not see restricted post');
			assert(pids.includes(normalPid), 'Student should see normal post');
		});

		it('should show targetRole posts to TAs on topic page', async () => {
			const topicObj = await topics.getTopicData(tid);
			const postsData = await topics.getTopicPosts(topicObj, `tid:${tid}:posts`, 0, -1, taUid, false);
			const pids = postsData.map(p => p.pid);
			assert(pids.includes(restrictedPid), 'TA should see restricted post');
		});

		it('should show targetRole posts to Professors on topic page', async () => {
			const topicObj = await topics.getTopicData(tid);
			const postsData = await topics.getTopicPosts(topicObj, `tid:${tid}:posts`, 0, -1, professorUid, false);
			const pids = postsData.map(p => p.pid);
			assert(pids.includes(restrictedPid), 'Professor should see restricted post');
		});

		it('should show targetRole posts to admins on topic page', async () => {
			const topicObj = await topics.getTopicData(tid);
			const postsData = await topics.getTopicPosts(topicObj, `tid:${tid}:posts`, 0, -1, adminUid, false);
			const pids = postsData.map(p => p.pid);
			assert(pids.includes(restrictedPid), 'Admin should see restricted post');
		});

		it('should show posts without targetRole to everyone', async () => {
			const topicObj = await topics.getTopicData(tid);
			const postsData = await topics.getTopicPosts(topicObj, `tid:${tid}:posts`, 0, -1, studentUid, false);
			const pids = postsData.map(p => p.pid);
			assert(pids.includes(normalPid), 'Student should see normal post');
		});
	});

	describe('privilege filter', () => {
		it('should filter targetRole posts from students via privileges.posts.filter', async () => {
			const filteredPids = await privileges.posts.filter('topics:read', [normalPid, restrictedPid], studentUid);
			assert(filteredPids.includes(normalPid), 'Student should see normal post');
			assert(!filteredPids.includes(restrictedPid), 'Student should not see restricted post');
		});

		it('should not filter targetRole posts from TAs via privileges.posts.filter', async () => {
			const filteredPids = await privileges.posts.filter('topics:read', [normalPid, restrictedPid], taUid);
			assert(filteredPids.includes(normalPid), 'TA should see normal post');
			assert(filteredPids.includes(restrictedPid), 'TA should see restricted post');
		});
	});

	describe('category teaser filtering', () => {
		let teaserTid;

		before(async () => {
			// Create a separate topic for teaser tests
			const result = await topics.post({
				uid: professorUid,
				cid: categoryObj.cid,
				title: 'Teaser Test Topic',
				content: 'Teaser main post',
			});
			teaserTid = result.topicData.tid;

			// Add an instructor-only reply (becomes the teaser)
			await topics.reply({
				uid: professorUid,
				tid: teaserTid,
				content: 'Secret instructor teaser',
				targetRole: 'ta',
			});
		});

		it('should not show targetRole post as teaser for students', async () => {
			const teasers = await topics.getTeasersByTids([teaserTid], studentUid);
			const teaser = teasers[0];
			if (teaser) {
				assert.notStrictEqual(teaser.content, 'Secret instructor teaser',
					'Student should not see instructor-only teaser');
			}
		});

		it('should show targetRole post as teaser for instructors', async () => {
			const teasers = await topics.getTeasersByTids([teaserTid], taUid);
			const teaser = teasers[0];
			assert(teaser, 'TA should get a teaser');
			assert.strictEqual(teaser.content, 'Secret instructor teaser');
		});
	});
});
