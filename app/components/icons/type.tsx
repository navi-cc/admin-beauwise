import * as React from 'react';
const Type = ({ className }: { className?: string }) => (
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
		<path d='M15 21H9' strokeLinejoin='round' />
		<path d='M12 3v18m0-18c1.387 0 3.17.03 4.588.176.6.062.9.093 1.166.202a2.05 2.05 0 0 1 1.165 1.299C19 4.954 19 5.27 19 5.902M12 3c-1.387 0-3.17.03-4.588.176-.6.062-.9.093-1.166.202A2.05 2.05 0 0 0 5.08 4.677C5 4.954 5 5.27 5 5.902' />
	</svg>
);
export default Type;
