import * as React from 'react';
const Undo = ({ className }: { className?: string }) => (
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
		<path d='M12 21A9 9 0 1 0 4.204 7.5' />
		<path d='M3 3v1.278c0 2.192 0 3.288.707 3.887.708.6 1.789.42 3.95.059L9 8' />
	</svg>
);
export default Undo;
