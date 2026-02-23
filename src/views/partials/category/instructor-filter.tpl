{{{ if showInstructorFilter }}}
<div class="btn-group bottom-sheet" component="category/instructor-filter">
	<button class="btn btn-ghost btn-sm ff-secondary d-flex gap-2 align-items-center dropdown-toggle" data-bs-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false" aria-label="[[topic:filter-by-audience]]">
		<i class="fa fa-fw fa-graduation-cap text-primary"></i>
		<span class="d-none d-md-inline fw-semibold">{{{ if instructorFilter }}}[[topic:instructor-topics-only]]{{{ else }}}[[topic:all-topics]]{{{ end }}}</span>
	</button>

	<ul class="dropdown-menu p-1 text-sm" role="menu">
		<li>
			<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="{config.relative_path}/category/{slug}{instructorFilterUrlAll}" role="menuitem">
				<span class="flex-grow-1">[[topic:all-topics]]</span>
				<i class="flex-shrink-0 fa fa-fw {{{ if !instructorFilter }}}fa-check text-primary{{{ end }}}"></i>
			</a>
		</li>
		<li>
			<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="{config.relative_path}/category/{slug}{instructorFilterUrlInstructor}" role="menuitem">
				<span class="flex-grow-1">[[topic:instructor-topics-only]]</span>
				<i class="flex-shrink-0 fa fa-fw {{{ if instructorFilter }}}fa-check text-primary{{{ end }}}"></i>
			</a>
		</li>
	</ul>
</div>
{{{ end }}}
