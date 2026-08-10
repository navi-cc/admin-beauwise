import * as React from 'react';
const Search = ({ size = 24, className }: { size?: number; className: string }) => (
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
		<path d='m15 15 1.5 1.5m.433 2.525a1.48 1.48 0 1 1 2.092-2.092l2.042 2.042a1.48 1.48 0 1 1-2.092 2.092zM16.5 9.5a7 7 0 1 0-14 0 7 7 0 0 0 14 0' />
	</svg>
);
export default Search;
