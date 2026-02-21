{{{ if (loggedIn && (privileges.canResolve || isOwner)) }}}
<a href="#" component="topic/resolve" class="btn btn-ghost btn-sm ff-secondary d-flex gap-2 align-items-center text-truncate {{{ if resolved }}}hidden{{{ end }}}" role="button"><i class="fa fa-fw fa-check-circle text-primary"></i><span class="d-none d-md-inline fw-semibold text-truncate text-nowrap">[[topic:thread-tools.resolve]]</span></a>
<a href="#" component="topic/unresolve" class="btn btn-ghost btn-sm ff-secondary d-flex gap-2 align-items-center text-truncate {{{ if !resolved }}}hidden{{{ end }}}" role="button"><i class="fa fa-fw fa-question-circle text-primary"></i><span class="d-none d-md-inline fw-semibold text-truncate text-nowrap">[[topic:thread-tools.unresolve]]</span></a>
{{{ end }}}
