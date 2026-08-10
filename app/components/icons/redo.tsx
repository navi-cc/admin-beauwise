import * as React from 'react';
const Redo = ({ className }: { className?: string }) => (
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
		<path d='M12 21a9 9 0 1 1 7.796-13.5' />
		<path d='M21 3v1.278c0 2.192 0 3.288-.708 3.887-.707.6-1.788.42-3.95.059L14.999 8' />
	</svg>
);
export default Redo;
