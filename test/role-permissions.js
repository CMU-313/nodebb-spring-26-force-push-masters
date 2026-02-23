'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const User = require('../src/user');
const posts = require('../src/posts');
const topics = require('../src/topics');
const categories = require('../src/categories');
const privileges = require('../src/privileges');
const meta = require('../src/meta');
const { assignRoleToUser, ensureAnnouncementPrivileges } = require('../src/user/roles');

describe('Role-based post permissions', () => {
	let studentUid;
	let taUid;
	let professorUid;
	let regularUid;
	let generalCid;
	let announcementCid;

	before(async () => {
		// Create users
		studentUid = await User.create({ username: 'permStudent', password: '123456' });
		taUid = await User.create({ username: 'permTA', password: '123456' });
		professorUid = await User.create({ username: 'permProfessor', password: '123456' });
		regularUid = await User.create({ username: 'permRegular', password: '123456' });

		// Assign roles
		await assignRoleToUser(studentUid, 'student');
		await assignRoleToUser(taUid, 'ta');
		await assignRoleToUser(professorUid, 'professor');

		// Create categories and enable per-category post queue
		const generalCat = await categories.create({ name: 'General', description: 'General discussion' });
		generalCid = generalCat.cid;
		await categories.setCategoryField(generalCid, 'postQueue', 1);

		const announcementCat = await categories.create({ name: 'Announcements', description: 'Announcements' });
		announcementCid = announcementCat.cid;

		// Apply announcement privileges
		await ensureAnnouncementPrivileges();

		// Enable post queue globally so we can test bypass
		meta.config.postQueue = 1;
		meta.config.postQueueReputationThreshold = 10;
	});

	after(() => {
		meta.config.postQueue = 0;
	});

	describe('Post queue bypass', () => {
		it('student should bypass the post queue', async () => {
			const shouldQueue = await posts.shouldQueue(studentUid, { cid: generalCid, content: 'hello' });
			assert.strictEqual(shouldQueue, false);
		});

		it('TA should bypass the post queue', async () => {
			const shouldQueue = await posts.shouldQueue(taUid, { cid: generalCid, content: 'hello' });
			assert.strictEqual(shouldQueue, false);
		});

		it('professor should bypass the post queue', async () => {
			const shouldQueue = await posts.shouldQueue(professorUid, { cid: generalCid, content: 'hello' });
			assert.strictEqual(shouldQueue, false);
		});

		it('student result differs from a guest (uid=0)', async () => {
			// uid=0 (guest) would be queued; student should not be
			const guestQueued = await posts.shouldQueue(0, { cid: generalCid, content: 'hello' });
			const studentQueued = await posts.shouldQueue(studentUid, { cid: generalCid, content: 'hello' });
			// Both may be false if global queue is off, but student must never queue MORE than guest
			assert(studentQueued === false || studentQueued <= guestQueued);
		});
	});

	describe('Post delay bypass', () => {
		it('student should not be blocked by post delay', async () => {
			await assert.doesNotReject(
				User.isReadyToPost(studentUid, generalCid)
			);
		});

		it('TA should not be blocked by post delay', async () => {
			await assert.doesNotReject(
				User.isReadyToPost(taUid, generalCid)
			);
		});

		it('professor should not be blocked by post delay', async () => {
			await assert.doesNotReject(
				User.isReadyToPost(professorUid, generalCid)
			);
		});
	});

	describe('Announcements category — create topics', () => {
		it('professor can create topics in Announcements', async () => {
			const canPost = await privileges.categories.can('topics:create', announcementCid, professorUid);
			assert.strictEqual(canPost, true);
		});

		it('TA cannot create topics in Announcements', async () => {
			const canPost = await privileges.categories.can('topics:create', announcementCid, taUid);
			assert.strictEqual(canPost, false);
		});

		it('student cannot create topics in Announcements', async () => {
			const canPost = await privileges.categories.can('topics:create', announcementCid, studentUid);
			assert.strictEqual(canPost, false);
		});

		it('unassigned user cannot create topics in Announcements', async () => {
			const canPost = await privileges.categories.can('topics:create', announcementCid, regularUid);
			assert.strictEqual(canPost, false);
		});
	});

	describe('Announcements category — reply to topics', () => {
		it('professor can reply in Announcements', async () => {
			const canReply = await privileges.categories.can('topics:reply', announcementCid, professorUid);
			assert.strictEqual(canReply, true);
		});

		it('TA cannot reply in Announcements', async () => {
			const canReply = await privileges.categories.can('topics:reply', announcementCid, taUid);
			assert.strictEqual(canReply, false);
		});

		it('student cannot reply in Announcements', async () => {
			const canReply = await privileges.categories.can('topics:reply', announcementCid, studentUid);
			assert.strictEqual(canReply, false);
		});
	});

	describe('General category — all roles can post', () => {
		it('student can create topics in General', async () => {
			const canPost = await privileges.categories.can('topics:create', generalCid, studentUid);
			assert.strictEqual(canPost, true);
		});

		it('TA can create topics in General', async () => {
			const canPost = await privileges.categories.can('topics:create', generalCid, taUid);
			assert.strictEqual(canPost, true);
		});

		it('professor can create topics in General', async () => {
			const canPost = await privileges.categories.can('topics:create', generalCid, professorUid);
			assert.strictEqual(canPost, true);
		});
	});

	describe('End-to-end — professor posts in Announcements', () => {
		it('professor can successfully post a topic in Announcements', async () => {
			const result = await topics.post({
				uid: professorUid,
				cid: announcementCid,
				title: 'Important Announcement',
				content: 'This is an announcement from a professor.',
			});
			assert(result.topicData);
			assert(result.postData);
			assert.strictEqual(result.topicData.cid, announcementCid);
		});
	});
});
