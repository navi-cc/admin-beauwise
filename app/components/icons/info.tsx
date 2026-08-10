const Info = ({ className }: { className?: string }) => (
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
		<circle cx={12} cy={12} r={10} />
		<path d='M12 16v-4m-.125-3.75H12m-.25 0a.25.25 0 1 1 .5 0 .25.25 0 0 1-.5 0' />
	</svg>
);
export default Info;
