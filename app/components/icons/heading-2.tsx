import * as React from 'react';
const Heading2 = ({ className }: { className?: string }) => (
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
		<path d='M3.5 5v14m10-14v14m7 0h-4v-.31c0-.438 0-.657.087-.852.086-.194.249-.34.575-.634l2.605-2.344c.467-.42.733-1.018.733-1.646V13a2 2 0 1 0-4 0v.4M3.5 12h10' />
	</svg>
);
export default Heading2;
