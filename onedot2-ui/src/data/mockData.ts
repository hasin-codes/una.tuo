import type { HistoryItem, ModelSpec, PresetDefinition, SessionStats, TemplateItem } from '../types'

export const modelBrandColors: Record<string, string> = {
  openai: '#10a37f',
  anthropic: '#d97757',
  google: '#4285f4',
  meta: '#7c3aed',
  mistral: '#ff7000',
  default: '#8a8a8a',
}

const baseResponse = `# Sentiment Analysis Overview\n\n## Key Takeaways\n- **Overall sentiment**: Moderately positive\n- **Confidence score**: 0.78\n- **Dominant emotions**: Trust, anticipation\n\n## Detailed Breakdown\n| Category | Positive | Neutral | Negative |\n| --- | --- | --- | --- |\n| Customer Support | 64% | 23% | 13% |\n| Product Reviews | 71% | 18% | 11% |\n| Social Media | 59% | 28% | 13% |\n\n## Recommended Actions\n1. Celebrate support team responsiveness.\n2. Maintain product roadmap transparency.\n3. Launch a proactive social listening sprint.\n\n> High-priority channels show repeatable positive signals with minor, addressable concerns.`

const creativeResponse = `# Narrative Variant\n\nImagine you are evaluating a bustling command center where customer experiences are tracked in real-time. The dashboards glow mostly in verdant greens with a few amber alerts nudging attention toward social platforms.\n\n- **Mood Arc**: Steady optimism with flickers of curiosity.\n- **Opportunities**: Amplify product success stories, humanize support staff, address trending feature requests.\n\nEnclose the key initiatives in a short manifesto:\n\n\`\`\`
We will listen actively.
We will respond promptly.
We will innovate boldly.
\`\`\`
\n## Next Sprint Focus\n- Run a story-mining session with support leads.\n- Prototype a social listening co-pilot dashboard.\n- Design uplift experiments for the onboarding journey.\n`

const conciseResponse = `## Executive Summary\n- Positive coverage is trending upward (+6% WoW).\n- Latency targets met in 93% of support interactions.\n- Average sentiment score: **0.78** (±0.04).\n\n### Recommended Next Steps\n- Roll out **Q4 brand consistency** playbook to regional teams.\n- Continue monitoring latency regression in EMEA.\n- Greenlight cross-model A/B evaluation tooling.\n`

export const initialModels: ModelSpec[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    providerLogo: '/assets/logos/openai.svg',
    brandColor: modelBrandColors.openai,
    contextSize: 128000,
    contextSizeDisplay: '128K',
    avgLatency: 2300,
    avgLatencyDisplay: '2.3s',
    costPer1KTokens: 0.01,
    costDisplay: '$0.01',
    status: 'active',
    apiKeyConfigured: true,
    selected: true,
    order: 0,
    versions: [
      {
        versionId: 'gpt-4-turbo-v1',
        versionNumber: 1,
        timestamp: '2025-11-09T10:15:00Z',
        response: baseResponse,
        tokens: { input: 58, output: 812, total: 870 },
        latencyMs: 2300,
        costUsd: 0.012,
      },
      {
        versionId: 'gpt-4-turbo-v2',
        versionNumber: 2,
        timestamp: '2025-11-09T10:17:00Z',
        response: creativeResponse,
        tokens: { input: 58, output: 1012, total: 1070 },
        latencyMs: 2480,
        costUsd: 0.015,
      },
    ],
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    providerLogo: '/assets/logos/anthropic.svg',
    brandColor: modelBrandColors.anthropic,
    contextSize: 200000,
    contextSizeDisplay: '200K',
    avgLatency: 2700,
    avgLatencyDisplay: '2.7s',
    costPer1KTokens: 0.008,
    costDisplay: '$0.008',
    status: 'active',
    apiKeyConfigured: true,
    selected: true,
    order: 1,
    versions: [
      {
        versionId: 'claude-3-opus-v1',
        versionNumber: 1,
        timestamp: '2025-11-09T10:16:00Z',
        response: conciseResponse,
        tokens: { input: 58, output: 640, total: 698 },
        latencyMs: 2685,
        costUsd: 0.009,
      },
      {
        versionId: 'claude-3-opus-v2',
        versionNumber: 2,
        timestamp: '2025-11-09T10:18:00Z',
        response: baseResponse,
        tokens: { input: 58, output: 790, total: 848 },
        latencyMs: 2740,
        costUsd: 0.011,
      },
    ],
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerLogo: '/assets/logos/google.svg',
    brandColor: modelBrandColors.google,
    contextSize: 1000000,
    contextSizeDisplay: '1M',
    avgLatency: 1950,
    avgLatencyDisplay: '1.9s',
    costPer1KTokens: 0.007,
    costDisplay: '$0.007',
    status: 'active',
    apiKeyConfigured: true,
    selected: true,
    order: 2,
    versions: [
      {
        versionId: 'gemini-1-5-pro-v1',
        versionNumber: 1,
        timestamp: '2025-11-09T10:20:00Z',
        response: baseResponse,
        tokens: { input: 58, output: 720, total: 778 },
        latencyMs: 1980,
        costUsd: 0.008,
      },
      {
        versionId: 'gemini-1-5-pro-v2',
        versionNumber: 2,
        timestamp: '2025-11-09T10:22:00Z',
        response: conciseResponse,
        tokens: { input: 58, output: 540, total: 598 },
        latencyMs: 2050,
        costUsd: 0.006,
      },
    ],
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    providerLogo: '/assets/logos/mistral.svg',
    brandColor: modelBrandColors.mistral,
    contextSize: 32000,
    contextSizeDisplay: '32K',
    avgLatency: 1650,
    avgLatencyDisplay: '1.6s',
    costPer1KTokens: 0.006,
    costDisplay: '$0.006',
    status: 'rate-limited',
    apiKeyConfigured: false,
    selected: false,
    order: 3,
    versions: [
      {
        versionId: 'mistral-large-v1',
        versionNumber: 1,
        timestamp: '2025-11-08T14:15:00Z',
        response: conciseResponse,
        tokens: { input: 48, output: 420, total: 468 },
        latencyMs: 1600,
        costUsd: 0.005,
      },
    ],
  },
]

export const templateItems: TemplateItem[] = [
  {
    id: 'template-1',
    name: 'Code Review Template',
    content:
      'Review the following {{language}} code and highlight any {{focus_areas}}. Provide suggestions in markdown.',
    variables: ['language', 'focus_areas'],
    charCount: 124,
    createdAt: '2025-11-08T14:30:00Z',
    lastUsed: '2025-11-09T10:15:00Z',
  },
  {
    id: 'template-2',
    name: 'UX Writing Helper',
    content:
      'Rewrite the copy with a {{tone}} tone and limit the message to {{word_limit}} words. Provide 3 variants.',
    variables: ['tone', 'word_limit'],
    charCount: 108,
    createdAt: '2025-11-06T11:00:00Z',
  },
  {
    id: 'template-3',
    name: 'Product Requirement Outline',
    content:
      'Generate a PRD outline for {{feature_name}} targeting {{audience}} with emphasis on {{priority}}.',
    variables: ['feature_name', 'audience', 'priority'],
    charCount: 138,
    createdAt: '2025-10-30T09:20:00Z',
    lastUsed: '2025-11-07T16:45:00Z',
  },
]

export const historyItems: HistoryItem[] = [
  {
    sessionId: 'session-1',
    title: 'Comparing sentiment analysis approaches',
    timestamp: '2025-11-09T08:45:00Z',
    lastModified: '2025-11-09T10:15:00Z',
    modelIds: ['gpt-4-turbo', 'claude-3-opus', 'gemini-1-5-pro'],
    modelColors: [modelBrandColors.openai, modelBrandColors.anthropic, modelBrandColors.google],
    turnCount: 8,
    summary: 'Multi-model comparison of customer sentiment outputs across three providers.',
  },
  {
    sessionId: 'session-2',
    title: 'Pricing page refresh concepts',
    timestamp: '2025-11-08T15:20:00Z',
    lastModified: '2025-11-08T16:05:00Z',
    modelIds: ['gpt-4-turbo', 'mistral-large'],
    modelColors: [modelBrandColors.openai, modelBrandColors.mistral],
    turnCount: 5,
    summary: 'Explored creative messaging for pricing page hero section.',
  },
  {
    sessionId: 'session-3',
    title: 'Support automation intents discovery',
    timestamp: '2025-11-07T09:10:00Z',
    lastModified: '2025-11-07T10:50:00Z',
    modelIds: ['claude-3-opus'],
    modelColors: [modelBrandColors.anthropic],
    turnCount: 3,
    summary: 'Clustered support tickets into high-level intents for automation candidates.',
  },
]

export const presets: PresetDefinition[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    icon: '🎯',
    description: 'Good for most tasks',
    isDefault: true,
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stream: true,
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: '🎨',
    description: 'Higher randomness for ideation',
    temperature: 1.2,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.5,
    presencePenalty: 0.8,
    stream: true,
  },
  {
    id: 'precise',
    name: 'Precise',
    icon: '🎓',
    description: 'Deterministic, structured outputs',
    temperature: 0.2,
    maxTokens: 1024,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stream: true,
  },
]

export const defaultSessionStats: SessionStats = {
  totalTokens: 12345,
  averageLatency: 2140,
  estimatedCost: 0.29,
  perModelCost: {
    'gpt-4-turbo': 0.12,
    'claude-3-opus': 0.1,
    'gemini-1-5-pro': 0.07,
  },
}
