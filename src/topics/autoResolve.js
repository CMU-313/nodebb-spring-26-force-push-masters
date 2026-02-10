'use strict';

const db = require('../database');
const groups = require('../groups');
const utils = require('../utils');

const STAFF_GROUPS = ['TAs', 'Professors'];

module.exports = function (Topics) {
	setImmediate(() => {
		const plugins = require('../plugins');
		plugins.hooks.register('core', {
			hook: 'action:post.save',
			method: async (data) => {
				const { post } = data;
				if (!post || !post.tid || !post.uid) {
					return;
				}
				// Only auto-resolve on replies, not on new topic creation
				if (post.isMain) {
					return;
				}
				// Skip remote/fediverse users
				if (!utils.isNumber(post.uid) || parseInt(post.uid, 10) <= 0) {
					return;
				}

				const [isStaff, currentResolved] = await Promise.all([
					groups.isMemberOfGroups(post.uid, STAFF_GROUPS),
					Topics.getTopicField(post.tid, 'resolved'),
				]);

				if (!isStaff.some(Boolean)) {
					return;
				}
				// Avoid redundant DB write if already resolved
				if (parseInt(currentResolved, 10) === 1) {
					return;
				}

				await Topics.setTopicField(post.tid, 'resolved', 1);
				const cid = await Topics.getTopicField(post.tid, 'cid');
				if (cid && utils.isNumber(cid)) {
					await db.sortedSetAdd(`cid:${cid}:tids:resolved`, 1, post.tid);
				}
			},
		});
	});
};
