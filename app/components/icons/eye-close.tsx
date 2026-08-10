import * as React from 'react';
const EyeClose = ({ className }: { className?: string }) => (
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
		<path d='M22 8c-2.202 3.023-5.86 5-10 5S4.202 11.023 2 8m13 5 1.5 3m3.5-5 2 2.5m-20 0L4 11m5 2-1.5 3' />
	</svg>
);
export default EyeClose;
