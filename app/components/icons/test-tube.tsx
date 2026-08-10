import * as React from 'react';
const TestTube = ({ size = 24, className }: { size?: number; className: string }) => (
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
	>
		<path d='M8 2h8' strokeLinejoin='round' />
		<path d='M5.533 11.15s3-.925 5.5 1.852m7.5-1.388s-.611.979-1.5 1.389' />
		<path
			d='M9.527 2v4.258c0 .662-.352 1.233-.933 1.544-2.985 1.6-5.79 6.133-2.848 10.778C6.404 19.72 8.576 22 12 22s5.596-2.28 6.254-3.419c2.941-4.645.137-9.178-2.848-10.778a1.73 1.73 0 0 1-.934-1.544V2.001'
			strokeLinejoin='round'
		/>
		<path
			d='M14.125 14H14m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-4.125 4H10m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0'
			strokeLinejoin='round'
		/>
	</svg>
);
export default TestTube;
