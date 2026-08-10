import * as React from 'react';
const User = ({ className }: { className?: string }) => (
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
		<circle cx={12} cy={7} r={4} />
		<path d='M12 14c-5 0-8 2.5-8 5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2c0-2.5-3-5-8-5' />
	</svg>
);
export default User;
