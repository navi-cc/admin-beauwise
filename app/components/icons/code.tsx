import * as React from 'react';
const Code = ({ className }: { className?: string }) => (
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
		<path d='m16 7 3.066 2.643C20.356 10.754 21 11.31 21 12s-.645 1.246-1.934 2.357L16 17M8 7 4.934 9.643C3.644 10.754 3 11.31 3 12s.645 1.246 1.934 2.357L8 17' />
	</svg>
);
export default Code;
