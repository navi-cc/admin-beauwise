import * as React from 'react';
const List = ({ className }: { className?: string }) => (
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
		<path d='M9.121 5h12m-12 7h12m-12 7h12' />
		<path
			d='M3.246 5h-.125m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-.125 7h-.125m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-.125 7h-.125m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0'
			strokeLinejoin='round'
		/>
	</svg>
);
export default List;
