import * as React from 'react';
const ExternalLink = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		strokeLinecap='round'
		className={className}
	>
		<path
			d='M15 3h3c1.414 0 2.121 0 2.56.44C21 3.878 21 4.585 21 6v3m-1-5-9 9'
			strokeLinejoin='round'
		/>
		<path d='M20 13c0 3.771 0 5.657-1.172 6.828S15.771 21 12 21h-1c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-1c0-3.771 0-5.657 1.172-6.828S7.229 4 11 4' />
	</svg>
);
export default ExternalLink;
