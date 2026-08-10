import * as React from 'react';
const Tag = ({ className, size }: { className?: string; size?: number }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		width={size}
		height={size}
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		className={className}
	>
		<circle
			cx={1.5}
			cy={1.5}
			r={1.5}
			transform='matrix(1 0 0 -1 16 8)'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path d='M2.774 11.144c-1.003 1.12-1.024 2.81-.104 4a34 34 0 0 0 6.186 6.186c1.19.92 2.88.899 4-.104a92 92 0 0 0 8.516-8.698 1.95 1.95 0 0 0 .47-1.094c.164-1.796.503-6.97-.902-8.374s-6.578-1.066-8.374-.901a1.95 1.95 0 0 0-1.094.47 92 92 0 0 0-8.698 8.515Z' />
		<path d='m7 14 3 3' strokeLinecap='round' strokeLinejoin='round' />
	</svg>
);
export default Tag;
