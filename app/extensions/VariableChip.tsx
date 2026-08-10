import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import Variable from '@/components/icons/variable';

export default function VariableChip(props: NodeViewProps) {
	const { node, selected } = props;
	const { name } = node.attrs;

	return (
		<NodeViewWrapper
			as='span'
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-primary-500/10 text-primary border border-primary/20 align-middle ${
				selected ? 'ring-2 ring-primary/50' : ''
			}`}
		>
			<Variable className='w-3 h-3' />
			<span>{`{{${name}}}`}</span>
		</NodeViewWrapper>
	);
}
