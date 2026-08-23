import * as React from 'react';
const UserRoundKey = ({ className }: { className?: string }) => (
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
		<path d='M15.5 7.5a5 5 0 1 0-10 0 5 5 0 0 0 10 0' />
		<path d='M15 14.138A7 7 0 0 0 3.5 19.5M16 18l4.5-4.5m-1 1.5 1 1m-4 3.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0' />
	</svg>
);
export default UserRoundKey;
