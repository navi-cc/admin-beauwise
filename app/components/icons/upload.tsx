import * as React from 'react';
const Upload = ({ className }: { className: string }) => (
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
		<path d='M3 17c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.121 2.122C5.605 21 6.07 21 7 21h10c.93 0 1.395 0 1.776-.102a3 3 0 0 0 2.122-2.122C21 18.396 21 17.93 21 17m-4.5-9.5S13.186 3 12 3 7.5 7.5 7.5 7.5M12 4v12' />
	</svg>
);
export default Upload;
