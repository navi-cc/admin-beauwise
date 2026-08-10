const MoreHorizontal = ({
	size = 24,
	className
}: {
	size?: number;
	className?: string;
}) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		width={size}
		height={size}
		color='currentColor'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		className={className}
	>
		<path d='M21 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Zm-7.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM6 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z' />
	</svg>
);
export default MoreHorizontal;
