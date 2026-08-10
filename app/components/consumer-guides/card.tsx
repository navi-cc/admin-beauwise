type CardProps = {
	name?: string;
};

export default function Card({ name }: CardProps) {
	return (
		<div className='bg-card border rounded-md border-accent p-4 hover:cursor-pointer hover:bg-muted transition-colors duration-300'>
			<div className='flex flex-col'>
				<p>The Green Dot</p>
				<span className='text-accent-foreground w-90'>
					Shows that the manufacturer pays a fee to a national organization to recover and
					recycle packaging waste.
				</span>
			</div>
		</div>
	);
}
