import * as React from 'react';
const Clock = ({ className }: { className: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		className={className}
	>
		<circle cx={12} cy={12} r={10} />
		<path d='M12 8v4l2 2' strokeLinecap='round' strokeLinejoin='round' />
	</svg>
);
export default Clock;
