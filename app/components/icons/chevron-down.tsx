import * as React from 'react';
const ChevronDown = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<path d='M18 9s-4.419 6-6 6-6-6-6-6' />
	</svg>
);
export default ChevronDown;
