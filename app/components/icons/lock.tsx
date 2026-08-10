import * as React from 'react';
const Lock = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		className={className}
	>
		<path
			d='M16.496 9V6.5a4.5 4.5 0 1 0-9 0V9'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M13.496 9h-3c-2.334 0-3.502 0-4.386.472a4 4 0 0 0-1.642 1.643c-.472.883-.472 2.05-.472 4.386 0 2.334 0 3.501.473 4.385a4 4 0 0 0 1.642 1.642C6.995 22 8.162 22 10.496 22h3c2.334 0 3.502 0 4.385-.472a4 4 0 0 0 1.642-1.642c.473-.884.473-2.051.473-4.386s0-3.502-.473-4.386a4 4 0 0 0-1.642-1.642C16.998 9 15.831 9 13.496 9Z'
			strokeLinecap='round'
		/>
		<circle cx={11.996} cy={15.5} r={2} />
	</svg>
);
export default Lock;
