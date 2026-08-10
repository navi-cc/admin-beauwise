import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
// import { FlaskConical, Play, Copy, Check, Alert, Sparkles } from 'lucide-react';

import { compileTemplate } from '@/utils/template-utils';
import type { TestVariable, PromptType } from '@/types/llm-ops';
import FlaskConical from '../icons/flask-conical';
import Play from '../icons/play';
import Copy from '../icons/copy';
import Check from '../icons/check';
import Alert from '../icons/alert';
import Sparkles from '../icons/sparkles';

interface TestPanelProps {
	template: string;
	variables: string[];
	contextUrls?: string[];
	promptType?: PromptType;
	promptName?: string;
}

const DEFAULT_MOCK_VALUES: Record<string, string> = {
	ingredients: 'Niacinamide, Salicylic Acid, Glycerin, Hyaluronic Acid',
	context_url:
		'https://pubchem.ncbi.nlm.nih.gov/compound/Niacinamide\nhttps://cosing.ec.europa.eu/ingredients/12345',
	'profiling.the_wash_test.post_wash_feel': 'Tight and dry',
	'profiling.the_wash_test.pore_size': 'Enlarged on T-zone',
	'profiling.the_wash_test.mid_day_shine': 'High shine',
	'profiling.sensitivity_reactivity.product_reactivity': 'High',
	'profiling.sensitivity_reactivity.redness_prone': 'Yes',
	'profiling.acne_texture.breakout_frequency': 'Weekly',
	'profiling.acne_texture.texture_concern': 'Roughness, Bumps',
	'profiling.environmental_factors.climate_reactivity': 'Sensitive to high humidity',
	'profiling.hair_length_structure.hair_length': 'Shoulder length',
	'profiling.hair_classification.hair_pattern': '2B Waves',
	'profiling.hair_classification.hair_texture': 'Medium',
	'profiling.hair_classification.hair_scalp_density': 'High density',
	'profiling.hair_porosity.water_absorption': 'Fast absorption',
	'profiling.hair_porosity.air_dry_time': '30-45 minutes',
	'profiling.scalp_health.scalp_condition': 'Dryness, Mild itching',
	'profiling.scalp_health.primary_concern': 'Dandruff prevention, Frizz control',
	'profiling.hair_care_routine.wash_frequency': '3 times per week',
	'profiling.hair_care_routine.chemical_treatments': 'Color treated',
	'profiling.hair_care_routine.product_knowledge': 'Intermediate',
	rawOcrText:
		'INGREDIENTS: AQUA, GLYCERIN, NIACINAMIDE, SALICYLIC ACID, HYALURONIC ACID, PHENOXYETHANOL, ETHYLHEXYLGLYCERIN.'
};

/**
 * Side panel for testing prompts by filling in runtime variables and previewing
 * the compiled Handlebars output. Supports auto-fill mock data.
 */
export function TestPanel({
	template,
	variables,
	contextUrls,
	promptType,
	promptName
}: TestPanelProps) {
	const resolvedContextUrls = useMemo(() => {
		if (contextUrls && contextUrls.length > 0) {
			return contextUrls.join('\n');
		}
		return DEFAULT_MOCK_VALUES.context_url;
	}, [contextUrls]);

	const [testVariables, setTestVariables] = useState<TestVariable[]>(() =>
		variables.map((name) => ({
			name,
			value:
				name === 'context_url' ? resolvedContextUrls : DEFAULT_MOCK_VALUES[name] || ''
		}))
	);
	const [compiledOutput, setCompiledOutput] = useState<string>('');
	const [compileError, setCompileError] = useState<string>('');
	const [copied, setCopied] = useState(false);

	// Sync test variables when the variables or contextUrls props change
	useEffect(() => {
		setTestVariables((prev) => {
			const existing = new Map(prev.map((v) => [v.name, v.value]));
			return variables.map((name) => ({
				name,
				value:
					name === 'context_url'
						? resolvedContextUrls || existing.get(name) || ''
						: existing.get(name) || DEFAULT_MOCK_VALUES[name] || ''
			}));
		});
	}, [variables, resolvedContextUrls]);

	const updateVariableValue = useCallback((name: string, value: string) => {
		setTestVariables((prev) => prev.map((v) => (v.name === name ? { ...v, value } : v)));
	}, []);

	const autoFillMockValues = useCallback(() => {
		setTestVariables(
			variables.map((name) => ({
				name,
				value:
					name === 'context_url'
						? resolvedContextUrls
						: DEFAULT_MOCK_VALUES[name] || 'Sample Value'
			}))
		);
	}, [variables, resolvedContextUrls]);

	const handleRunTest = useCallback(() => {
		try {
			setCompileError('');
			const flatMap: Record<string, any> = {};
			testVariables.forEach((v) => {
				flatMap[v.name] = v.value;
			});

			const output = compileTemplate(template, flatMap);

			if (output.startsWith('[Template Error:')) {
				setCompileError(output);
				setCompiledOutput('');
			} else {
				setCompiledOutput(output);
			}
		} catch (err: any) {
			setCompileError(err.message || 'Failed to compile template.');
			setCompiledOutput('');
		}
	}, [template, testVariables]);

	const handleCopyOutput = useCallback(() => {
		if (!compiledOutput) return;
		navigator.clipboard.writeText(compiledOutput);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [compiledOutput]);

	return (
		<Card className='border-border'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-base flex items-center gap-2'>
						<FlaskConical className='h-4 w-4 text-violet-600' />
						Prompt Test Playground
					</CardTitle>
				</div>
				<CardDescription className='text-xs'>
					Input test values for runtime variables and preview compiled prompt text.
				</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Variables Form inputs */}
				<div className='max-h-[200px] overflow-y-auto pr-2'>
					<div className='space-y-3'>
						{testVariables.map((v) => (
							<div key={v.name} className='space-y-1'>
								<Label className='text-[11px] font-mono text-violet-700 dark:text-violet-400 font-semibold'>
									{`{{${v.name}}}`}
								</Label>
								{v.name === 'ingredients' ||
								v.name === 'context_url' ||
								v.name === 'rawOcrText' ? (
									<Textarea
										value={v.value}
										onChange={(e) => updateVariableValue(v.name, e.target.value)}
										rows={2}
										className='text-xs font-mono resize-none'
										placeholder={`Enter ${v.name}...`}
									/>
								) : (
									<Input
										value={v.value}
										onChange={(e) => updateVariableValue(v.name, e.target.value)}
										className='h-8 text-xs font-mono'
										placeholder={`Enter ${v.name}...`}
									/>
								)}
							</div>
						))}
					</div>
				</div>

				<Button
					onClick={handleRunTest}
					className='w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 z-50'
				>
					<Play className='h-4 w-4 fill-current' />
					Compile & Preview Prompt Output
				</Button>

				{/* Compile Error Output */}
				{compileError && (
					<div className='p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono'>
						<div className='flex items-center gap-1.5 font-semibold mb-1'>
							<Alert className='h-3.5 w-3.5' />
							Compilation Error
						</div>
						{compileError}
					</div>
				)}

				{/* Compiled Output Preview */}
				{compiledOutput && (
					<div className='space-y-2 pt-2 border-t'>
						<div className='flex items-center justify-between'>
							<span className='text-xs font-semibold text-foreground'>
								Compiled Output Preview:
							</span>
							<Button
								variant='ghost'
								size='sm'
								onClick={handleCopyOutput}
								className='h-7 text-[11px] gap-1'
							>
								{copied ? (
									<>
										<Check className='h-3 w-3 text-emerald-600' />
										Copied
									</>
								) : (
									<>
										<Copy className='h-3 w-3' />
										Copy Text
									</>
								)}
							</Button>
						</div>
						<div className='p-3 rounded-md bg-muted/50 border text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto'>
							{compiledOutput}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
