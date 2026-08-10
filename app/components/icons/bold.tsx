import * as React from 'react';
const Bold = ({ className }: { className?: string }) => (
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
		<path d='M13 4h-3c-1.886 0-2.828 0-3.414.586S6 6.114 6 8v4h7a4 4 0 0 0 0-8m1 8H6v4c0 1.886 0 2.828.586 3.414S8.114 20 10 20h4a4 4 0 0 0 0-8' />
	</svg>
);
export default Bold;
