import * as React from 'react';
const Package = ({ className }: { className?: string }) => (
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
		<path d='M2.492 7.5v6c0 3.771 0 5.657 1.172 6.828S6.72 21.5 10.492 21.5h3c3.771 0 5.657 0 6.829-1.172s1.171-3.057 1.171-6.828v-6M3.861 5.315 2.492 7.5h19L20.24 5.413c-.854-1.423-1.28-2.134-1.968-2.524-.688-.389-1.518-.389-3.177-.389h-6.15c-1.623 0-2.435 0-3.113.375-.678.376-1.109 1.064-1.97 2.44m8.13 2.185v-5m-6 15.5h5m-5-3h3' />
	</svg>
);
export default Package;
