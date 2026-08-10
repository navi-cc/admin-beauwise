import * as React from 'react';
const FileText = ({ className }: { className?: string }) => (
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
		<path d='M8 7h8m-8 4h4m1 10.5V21c0-2.828 0-4.243.879-5.121C14.757 15 16.172 15 19 15h.5m.5-1.657V10c0-3.771 0-5.657-1.172-6.828S15.771 2 12 2 6.343 2 5.172 3.172 4 6.229 4 10v4.544c0 3.245 0 4.868.886 5.967a4 4 0 0 0 .603.603C6.59 22 8.211 22 11.456 22c.705 0 1.058 0 1.381-.114q.1-.036.197-.082c.31-.148.559-.397 1.058-.896l4.736-4.736c.579-.578.867-.867 1.02-1.235.152-.368.152-.776.152-1.594' />
	</svg>
);
export default FileText;
