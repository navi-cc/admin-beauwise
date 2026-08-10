import * as React from 'react';
const UnfoldMore = ({ size = 24, className }: { size?: number; className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		width={size}
		height={size}
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<path d='M18 14s-4.419 5-6 5-6-5-6-5m12-4s-4.419-5-6-5-6 5-6 5' />
	</svg>
);
export default UnfoldMore;
