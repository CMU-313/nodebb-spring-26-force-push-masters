'use strict';

const groups = require('../groups');
const privileges = require('../privileges');

const ROLE_DEFAULT = 'student';
const ROLE_DEFS = {
	student: {
		group: 'Students',
		title: 'Student',
		description: 'Default student role',
	},
	ta: {
		group: 'TAs',
		title: 'TA',
		description: 'Teaching assistant role',
	},
	professor: {
		group: 'Professors',
		title: 'Professor',
		description: 'Instructor role',
	},
};

const ROLE_PRIVILEGES = {
	ta: {
		category: [
			'groups:posts:edit',
			'groups:posts:delete',
			'groups:posts:view_deleted',
			'groups:posts:history',
			'groups:topics:delete',
		],
	},
	professor: {
		category: [
			'groups:posts:edit',
			'groups:posts:delete',
			'groups:posts:view_deleted',
			'groups:posts:history',
			'groups:topics:delete',
			'groups:topics:schedule',
			'groups:purge',
		],
	},
};

function normalizeRole(role) {
	if (!role) {
		return ROLE_DEFAULT;
	}
	const key = String(role).trim().toLowerCase();
	return ROLE_DEFS[key] ? key : ROLE_DEFAULT;
}

function requiresApproval(role) {
	const normalized = normalizeRole(role);
	return normalized === 'ta' || normalized === 'professor';
}

async function ensureRoleGroups() {
	const roleKeys = Object.keys(ROLE_DEFS);
	for (const role of roleKeys) {
		const def = ROLE_DEFS[role];
		// eslint-disable-next-line no-await-in-loop
		const exists = await groups.exists(def.group);
		if (exists) {
			continue;
		}
		// eslint-disable-next-line no-await-in-loop
		await groups.create({
			name: def.group,
			userTitle: def.title,
			userTitleEnabled: 1,
			description: def.description,
			hidden: 0,
			private: 1,
			disableJoinRequests: 1,
		});
	}
}

async function ensureRolePrivileges() {
	const ta = ROLE_DEFS.ta.group;
	const professor = ROLE_DEFS.professor.group;

	if (ROLE_PRIVILEGES.ta?.category?.length) {
		await privileges.categories.give(ROLE_PRIVILEGES.ta.category, -1, [ta]);
	}
	if (ROLE_PRIVILEGES.professor?.category?.length) {
		await privileges.categories.give(ROLE_PRIVILEGES.professor.category, -1, [professor]);
	}
}

async function assignRoleToUser(uid, role) {
	const normalized = normalizeRole(role);
	await ensureRoleGroups();
	await ensureRolePrivileges();
	const groupName = ROLE_DEFS[normalized].group;
	await groups.join(groupName, uid);
}

module.exports = {
	ROLE_DEFAULT,
	ROLE_DEFS,
	normalizeRole,
	requiresApproval,
	assignRoleToUser,
};
