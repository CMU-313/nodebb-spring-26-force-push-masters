'use strict';

define('forum/composerTargetRole', ['hooks'], function (hooks) {
	const ComposerTargetRole = {};

	ComposerTargetRole.init = function () {
		hooks.on('action:composer.enhanced', function (data) {
			const { postContainer, postData } = data;
			if (!postData || !postData.cid) {
				return;
			}
			if (postContainer.find('[component="composer/target-role"]').length) {
				return;
			}
			const wrapper = $(
				'<div component="composer/target-role" class="d-flex align-items-center gap-1">' +
				'<label class="form-label mb-0 text-nowrap">[[topic:composer.post-to]]</label>' +
				'<select class="form-select form-select-sm" style="width: auto;">' +
				'<option value="">[[topic:composer.post-to-all]]</option>' +
				'<option value="ta">[[topic:composer.post-to-instructors]]</option>' +
				'</select></div>'
			);
			const actionBar = postContainer.find('.action-bar');
			if (actionBar.length) {
				actionBar.prepend(wrapper);
				wrapper.find('label').translateHtml('[[topic:composer.post-to]]');
				wrapper.find('option[value=""]').translateHtml('[[topic:composer.post-to-all]]');
				wrapper.find('option[value="ta"]').translateHtml('[[topic:composer.post-to-instructors]]');
			}
		});

		hooks.on('filter:composer.submit', function (submitHookData) {
			if (submitHookData.action !== 'topics.post' && submitHookData.action !== 'posts.reply') {
				return;
			}
			const composerEl = submitHookData.composerEl;
			const targetRoleSelect = composerEl.find('[component="composer/target-role"] select');
			if (targetRoleSelect.length) {
				const val = targetRoleSelect.val();
				submitHookData.composerData.targetRole = val || undefined;
			}
		});
	};

	return ComposerTargetRole;
});
