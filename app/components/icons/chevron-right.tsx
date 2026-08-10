import * as React from 'react';
const ChevronRight = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={2.5}
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<path d='M9 18s6-4.419 6-6-6-6-6-6' />
	</svg>
);
export default ChevronRight;
