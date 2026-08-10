import * as React from 'react';
const RestartList = ({ size, className }: { size?: number; className?: string }) => (
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
		<path d='M3 4.5h18m-18 7h5m-5 7h5m4.758-1a4.5 4.5 0 1 0-.193-4.685M12 9.5v1c0 1.414 0 2.121.44 2.56.439.44 1.146.44 2.56.44h1' />
	</svg>
);
export default RestartList;
