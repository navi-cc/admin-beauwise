import * as React from 'react';
const Loader = ({
	size = 24,
	className
}: {
	size?: number | undefined;
	className: string;
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
		className={className}
	>
		<path d='M21.996 12c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10' />
	</svg>
);
export default Loader;
