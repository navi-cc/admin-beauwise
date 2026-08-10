import * as React from 'react';
const ChevronDownUp = ({
	size = 24,
	className
}: {
	size?: number;
	className?: string;
}) => (
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
		<path d='M7 19s3.682-5 5-5 5 5 5 5M7 5s3.682 5 5 5 5-5 5-5' />
	</svg>
);
export default ChevronDownUp;
