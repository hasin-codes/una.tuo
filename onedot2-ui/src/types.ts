export type ModelStatus = 'active' | 'rate-limited' | 'error' | 'inactive';

export interface ModelVersion {
  versionId: string;
  versionNumber: number;
  timestamp: string;
  response: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  latencyMs: number;
  costUsd: number;
}

export interface ModelSpec {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  brandColor: string;
  contextSize: number;
  contextSizeDisplay: string;
  avgLatency: number;
  avgLatencyDisplay: string;
  costPer1KTokens: number;
  costDisplay: string;
  status: ModelStatus;
  apiKeyConfigured: boolean;
  selected: boolean;
  order: number;
  versions: ModelVersion[];
}

export interface TemplateItem {
  id: string;
  name: string;
  content: string;
  variables: string[];
  charCount: number;
  createdAt: string;
  lastUsed?: string;
}

export interface HistoryItem {
  sessionId: string;
  title: string;
  timestamp: string;
  lastModified: string;
  modelIds: string[];
  modelColors: string[];
  turnCount: number;
  summary: string;
}

export interface PresetDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault?: boolean;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stream: boolean;
}

export interface PromptAttachment {
  id: string;
  name: string;
  size: number;
  type: 'text' | 'image' | 'code' | 'data';
}

export interface SessionStats {
  totalTokens: number;
  averageLatency: number;
  estimatedCost: number;
  perModelCost: Record<string, number>;
}
