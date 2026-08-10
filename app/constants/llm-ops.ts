import Brain from '@/components/icons/brain';
import Cpu from '@/components/icons/cpu';
import FlaskConical from '@/components/icons/flask-conical';
import GitBranch from '@/components/icons/git-branch';
import Pencil from '@/components/icons/penicl';
import Plus from '@/components/icons/plus';
import RotateCcw from '@/components/icons/rotate-ccw';
import Settings from '@/components/icons/settings';
import Sparkles from '@/components/icons/sparkles';
import Tag from '@/components/icons/tag';
import ToggleLeft from '@/components/icons/toggle-left';
import Trash from '@/components/icons/trash';
import Zap from '@/components/icons/zap';
import type {
	ModelOption,
	TagOption,
	ActivityAction,
	PromptType,
	PromptTypeConfig
} from '@/types/llm-ops';

export const GEMINI_MODELS: ModelOption[] = [
	{
		id: 'gemini-3.1-flash-lite',
		name: 'Gemini 3.1 Flash-Lite',
		description:
			'The most cost-efficient model, optimized for high-volume agentic tasks, translation, and simple data processing.'
	},
	{
		id: 'gemini-3.5-flash',
		name: 'Gemini 3.5 Flash',
		description:
			'The most intelligent model built for speed, combining frontier intelligence with superior search and grounding.'
	},
	{
		id: 'gemini-3.6-flash',
		name: 'Gemini 3.6 Flash',
		description:
			'The most intelligent model built for speed, combining frontier intelligence with superior search and grounding.'
	}
];

export const DEFAULT_TAGS: TagOption[] = [
	{
		label: 'Development',
		value: 'development',
		color: 'bg-blue-500/15 text-blue-700 border-blue-500/20'
	},
	{
		label: 'Production',
		value: 'production',
		color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20'
	}
];

export const PROMPT_TYPES: Record<PromptType, PromptTypeConfig> = {
	ingredient_analysis: {
		id: 'ingredient_analysis',
		label: 'Ingredient Analysis Prompt',
		description:
			'Analyzes ingredients against user profiling data, care routines, and research context.',
		badgeColor: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20',
		variables: [
			// Top-level Inputs
			{
				name: 'ingredients',
				path: 'ingredients',
				label: 'Ingredients List',
				type: 'array',
				category: 'Inputs & Links',
				required: true,
				description: 'Array of ingredient names (auto-formatted at runtime)'
			},
			{
				name: 'user_recommended_ingredients',
				path: 'user_recommended_ingredients',
				label: 'User Recommended Ingredients',
				type: 'array',
				category: 'User Recommended Ingredients',
				required: true,
				description: 'The ingredients that is recommended for the user.'
			},
			{
				name: 'context_url',
				path: 'context_url',
				label: 'Context URLs',
				type: 'url_array',
				category: 'Inputs & Links',
				required: true,
				maxLimit: 20,
				description: 'Array of reference URLs (maximum 20 links)'
			},
			// Wash Test
			{
				name: 'profiling.the_wash_test.post_wash_feel',
				path: 'profiling.the_wash_test.post_wash_feel',
				label: 'Post Wash Feel',
				type: 'string',
				category: 'The Wash Test',
				required: true,
				description: 'Skin/hair feel after washing'
			},
			{
				name: 'profiling.the_wash_test.pore_size',
				path: 'profiling.the_wash_test.pore_size',
				label: 'Pore Size',
				type: 'string',
				category: 'The Wash Test',
				required: true,
				description: 'Observed pore size classification'
			},
			{
				name: 'profiling.the_wash_test.mid_day_shine',
				path: 'profiling.the_wash_test.mid_day_shine',
				label: 'Mid Day Shine',
				type: 'string',
				category: 'The Wash Test',
				required: true,
				description: 'Shine / oiliness level by mid-day'
			},
			// Sensitivity & Reactivity
			{
				name: 'profiling.sensitivity_reactivity.product_reactivity',
				path: 'profiling.sensitivity_reactivity.product_reactivity',
				label: 'Product Reactivity',
				type: 'string',
				category: 'Sensitivity & Reactivity',
				required: true,
				description: 'Reactivity level to skincare/haircare products'
			},
			{
				name: 'profiling.sensitivity_reactivity.redness_prone',
				path: 'profiling.sensitivity_reactivity.redness_prone',
				label: 'Redness Prone',
				type: 'string',
				category: 'Sensitivity & Reactivity',
				required: true,
				description: 'Prone to redness or irritation'
			},
			// Acne & Texture
			{
				name: 'profiling.acne_texture.breakout_frequency',
				path: 'profiling.acne_texture.breakout_frequency',
				label: 'Breakout Frequency',
				type: 'string',
				category: 'Acne & Texture',
				required: true,
				description: 'Frequency of acne breakouts'
			},
			{
				name: 'profiling.acne_texture.texture_concern',
				path: 'profiling.acne_texture.texture_concern',
				label: 'Texture Concerns',
				type: 'array',
				category: 'Acne & Texture',
				required: true,
				description: 'List of skin texture concerns'
			},
			// Environmental Factors
			{
				name: 'profiling.environmental_factors.climate_reactivity',
				path: 'profiling.environmental_factors.climate_reactivity',
				label: 'Climate Reactivity',
				type: 'string',
				category: 'Environmental Factors',
				required: true,
				description: 'Reactivity to humidity, climate, or weather'
			},
			{
				name: 'profiling.hair_length_structure.hair_length',
				path: 'profiling.hair_length_structure.hair_length',
				label: 'Hair Length',
				type: 'string',
				category: 'Hair Length & Structure',
				required: true,
				description: 'User hair length'
			},
			// Hair Classification
			{
				name: 'profiling.hair_classification.hair_pattern',
				path: 'profiling.hair_classification.hair_pattern',
				label: 'Hair Pattern',
				type: 'string',
				category: 'Hair Classification',
				required: true,
				description: 'Curl/wave pattern classification'
			},
			{
				name: 'profiling.hair_classification.hair_texture',
				path: 'profiling.hair_classification.hair_texture',
				label: 'Hair Texture',
				type: 'string',
				category: 'Hair Classification',
				required: true,
				description: 'Fine, medium, or coarse texture'
			},
			{
				name: 'profiling.hair_classification.hair_scalp_density',
				path: 'profiling.hair_classification.hair_scalp_density',
				label: 'Hair Scalp Density',
				type: 'string',
				category: 'Hair Classification',
				required: true,
				description: 'Scalp hair density level'
			},
			// Hair Porosity
			{
				name: 'profiling.hair_porosity.water_absorption',
				path: 'profiling.hair_porosity.water_absorption',
				label: 'Water Absorption',
				type: 'string',
				category: 'Hair Porosity',
				required: true,
				description: 'Speed of water absorption by hair'
			},
			{
				name: 'profiling.hair_porosity.air_dry_time',
				path: 'profiling.hair_porosity.air_dry_time',
				label: 'Air Dry Time',
				type: 'string',
				category: 'Hair Porosity',
				required: true,
				description: 'Estimated air dry duration'
			},
			// Scalp Health
			{
				name: 'profiling.scalp_health.scalp_condition',
				path: 'profiling.scalp_health.scalp_condition',
				label: 'Scalp Condition',
				type: 'array',
				category: 'Scalp Health',
				required: true,
				description: 'Conditions affecting scalp'
			},
			{
				name: 'profiling.scalp_health.primary_concern',
				path: 'profiling.scalp_health.primary_concern',
				label: 'Primary Concerns',
				type: 'array',
				category: 'Scalp Health',
				required: true,
				description: 'Primary scalp & hair concerns'
			},
			// Hair Care Routine
			{
				name: 'profiling.hair_care_routine.wash_frequency',
				path: 'profiling.hair_care_routine.wash_frequency',
				label: 'Wash Frequency',
				type: 'string',
				category: 'Hair Care Routine',
				required: true,
				description: 'How often hair is washed'
			},
			{
				name: 'profiling.hair_care_routine.chemical_treatments',
				path: 'profiling.hair_care_routine.chemical_treatments',
				label: 'Chemical Treatments',
				type: 'array',
				category: 'Hair Care Routine',
				required: true,
				description: 'Dyes, relaxers, or chemical treatments used'
			},
			{
				name: 'profiling.hair_care_routine.product_knowledge',
				path: 'profiling.hair_care_routine.product_knowledge',
				label: 'Product Knowledge',
				type: 'string',
				category: 'Hair Care Routine',
				required: true,
				description: 'User self-rated product knowledge level'
			}
		]
	},
	ocr_ingredient_parser: {
		id: 'ocr_ingredient_parser',
		label: 'OCR Ingredient Parser',
		description:
			'Parses raw OCR label text to extract clean ingredient lists and structural details.',
		badgeColor: 'bg-teal-500/15 text-teal-700 border-teal-500/20',
		variables: [
			{
				name: 'rawOcrText',
				path: 'rawOcrText',
				label: 'Raw OCR Text',
				type: 'string',
				category: 'OCR Data',
				required: true,
				description: 'Raw text scanned from product packaging via OCR'
			}
		]
	}
};

export const STATUS_CONFIG = {
	draft: {
		label: 'Draft',
		color: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/20',
		dotColor: 'bg-yellow-500'
	},
	active: {
		label: 'Active',
		color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
		dotColor: 'bg-emerald-500'
	},
	archived: {
		label: 'Archived',
		color: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/20',
		dotColor: 'bg-zinc-400'
	}
} as const;

export const ACTIVITY_ACTION_CONFIG: Record<
	ActivityAction,
	{ label: string; icon: typeof Plus; color: string }
> = {
	created: {
		label: 'Created',
		icon: Plus,
		color: 'text-emerald-500 bg-emerald-500/10'
	},
	updated: {
		label: 'Updated',
		icon: Pencil,
		color: 'text-blue-500 bg-blue-500/10'
	},
	deleted: {
		label: 'Deleted',
		icon: Trash,
		color: 'text-red-500 bg-red-500/10'
	},
	version_created: {
		label: 'New Version',
		icon: GitBranch,
		color: 'text-violet-500 bg-violet-500/10'
	},
	tag_changed: {
		label: 'Tags Changed',
		icon: Tag,
		color: 'text-amber-500 bg-amber-500/10'
	},
	model_changed: {
		label: 'Model Changed',
		icon: Settings,
		color: 'text-cyan-500 bg-cyan-500/10'
	},
	status_changed: {
		label: 'Status Changed',
		icon: ToggleLeft,
		color: 'text-orange-500 bg-orange-500/10'
	},
	tested: {
		label: 'Tested',
		icon: FlaskConical,
		color: 'text-pink-500 bg-pink-500/10'
	},
	rollback: {
		label: 'Rolled Back',
		icon: RotateCcw,
		color: 'text-rose-500 bg-rose-500/10'
	}
};

export const MODEL_ICONS: Record<string, typeof Sparkles> = {
	'gemini-3.6-flash': Brain,
	'gemini-3.5-flash': Zap,
	'gemini-3.1-flash-lite': Sparkles
};

export const COLLECTIONS = {
	PROMPTS: 'prompts',
	VERSIONS: 'versions',
	ACTIVITY_LOGS: 'promptActivityLogs'
} as const;
