import * as React from 'react';
const Books = ({ className }: { className?: string }) => (
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
		<path d='M3 9h15c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 10.602 21 11.068 21 12s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 15 18.932 15 18 15h-5m-7 0H3m10 0h2c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C18 16.602 18 17.068 18 18s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C16.398 21 15.932 21 15 21H3M3 3h11c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C17 4.602 17 5.068 17 6s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C15.398 9 14.932 9 14 9H3' />
		<path d='M13 9v6.19c0 1.115 0 1.672-.326 1.79-.327.12-.696-.304-1.433-1.15l-.482-.552c-.353-.405-.529-.607-.759-.607s-.406.202-.76.607l-.48.552c-.738.846-1.107 1.27-1.433 1.15C7 16.862 7 16.305 7 15.19V9' />
	</svg>
);
export default Books;
