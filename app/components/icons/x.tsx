import * as React from 'react';
const X = ({ size = 24, className }: { size?: number; className: string }) => (
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
		<path d='m18 6-6 6m0 0-6 6m6-6 6 6m-6-6L6 6' />
	</svg>
);
export default X;
