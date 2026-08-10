import * as React from 'react';
const Pencil = ({ size = 24, className }: { size?: number; className: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		width={size}
		height={size}
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		strokeLinejoin='round'
		className={className}
	>
		<path d='m16.425 4.605.99-.99a2.1 2.1 0 0 1 2.97 2.97l-.99.99m-2.97-2.97-6.66 6.66a3.96 3.96 0 0 0-1.041 1.84L8 16l2.896-.724a3.96 3.96 0 0 0 1.84-1.042l6.659-6.659m-2.97-2.97 2.97 2.97' />
		<path
			d='M19 13.5c0 3.288 0 4.931-.908 6.038a4 4 0 0 1-.554.554C16.43 21 14.788 21 11.5 21H11c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-.5c0-3.287 0-4.931.908-6.038q.25-.304.554-.554C5.57 5 7.212 5 10.5 5'
			strokeLinecap='round'
		/>
	</svg>
);
export default Pencil;
