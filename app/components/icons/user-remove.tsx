import * as React from 'react';
const UserRemove = ({ className }: { className?: string }) => (
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
		<path d='M12.495 14.066 11.5 14q-.531.015-1 .038c-3.7.181-6.716 3.268-7 6.962m17-5L18 18.5m0 0L15.5 21m2.5-2.5 2.5 2.5M18 18.5 15.5 16' />
		<circle cx={11.5} cy={7} r={4} />
	</svg>
);
export default UserRemove;
