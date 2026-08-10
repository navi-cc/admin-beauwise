import * as React from 'react';
const Italic = ({ className }: { className?: string }) => (
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
		<path d='M10.667 4H20M7.999 20l8-16m-12 16h9.333' />
	</svg>
);
export default Italic;
