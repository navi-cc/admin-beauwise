import * as React from 'react';
const MonitorSmartphone = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		className={className}
	>
		<path d='M11.492 19h-4' strokeLinecap='round' strokeLinejoin='round' />
		<path d='M9.992 19v-4' />
		<path d='M19.492 12h-2l.25 1h1.5z' strokeLinecap='round' strokeLinejoin='round' />
		<path d='M14.992 15c0-1.414 0-2.121.44-2.56.439-.44 1.146-.44 2.56-.44h1c1.414 0 2.121 0 2.56.44.44.439.44 1.146.44 2.56v4c0 1.414 0 2.121-.44 2.56-.439.44-1.146.44-2.56.44h-1c-1.414 0-2.121 0-2.56-.44-.44-.439-.44-1.146-.44-2.56z' />
		<path
			d='M11.492 15h-3.8c-2.687 0-4.03 0-4.865-.816s-.835-2.129-.835-4.755V7.57c0-2.626 0-3.94.835-4.755S5.005 2 7.692 2h7.6c2.687 0 4.03 0 4.865.816s.835 2.129.835 4.755V8.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default MonitorSmartphone;
