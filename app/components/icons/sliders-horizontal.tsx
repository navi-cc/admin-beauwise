import * as React from 'react';
const SlidersHorizontal = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		strokeLinecap='round'
		className={className}
	>
		<path d='M4 5h6m3 0h7m-4 4v6M10 2v6m2 8v6m4-10h4M4 12h9m-1 7h8M4 19h5' />
	</svg>
);
export default SlidersHorizontal;
