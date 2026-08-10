import * as React from 'react';
const UserMultipleIcon = ({ size = 24, color = 'black' }) => (
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
	>
		<path d='M13 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0' />
		<path d='M11.039 7.558a4 4 0 1 1 1.923 2.885M15 21a6 6 0 0 0-12 0' />
		<path d='M21 17a6 6 0 0 0-6-6' />
	</svg>
);
export default UserMultipleIcon;
