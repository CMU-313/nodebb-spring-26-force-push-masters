{{{ if (loggedIn && (privileges.canResolve || isOwner)) }}}
<span class="topic-resolve-control d-flex gap-2 align-items-center">
	<a href="#" component="topic/resolve" class="btn btn-ghost btn-sm border border-gray-300 text-body {{{ if resolved }}}hidden{{{ end }}}" role="button"><i class="fa fa-fw fa-check-circle"></i> [[topic:thread-tools.resolve]]</a>
	<a href="#" component="topic/unresolve" class="btn btn-ghost btn-sm border border-gray-300 text-body {{{ if !resolved }}}hidden{{{ end }}}" role="button"><i class="fa fa-fw fa-question-circle"></i> [[topic:thread-tools.unresolve]]</a>
</span>
{{{ end }}}
