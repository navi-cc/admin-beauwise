import * as React from 'react';
const ArrowUpDown = ({ size = 24, color = 'black' }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		width={size}
		height={size}
		color={color}
		fill='none'
		stroke={color}
		strokeWidth={1.5}
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M7 4v16m10-1V4m-7 3S7.79 4 7 4 4 7 4 7m16 10s-2.21 3-3 3-3-3-3-3' />
	</svg>
);
export default ArrowUpDown;
