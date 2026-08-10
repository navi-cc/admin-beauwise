const ToggleLeft = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		className={className}
	>
		<path d='M11 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
		<path d='M16 6H8a6 6 0 1 0 0 12h8a6 6 0 0 0 0-12Z' />
	</svg>
);
export default ToggleLeft;
