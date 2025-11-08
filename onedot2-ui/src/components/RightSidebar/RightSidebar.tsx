import { useMemo, useState } from 'react'
import type { PresetDefinition, SessionStats } from '../../types'

interface ParametersState {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  stream: boolean
}

interface RightSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  parameters: ParametersState
  onParameterChange: <K extends keyof ParametersState>(key: K, value: ParametersState[K]) => void
  onResetParameters: () => void
  presets: PresetDefinition[]
  activePresetId: string
  onSelectPreset: (presetId: string) => void
  stats: SessionStats
  theme: 'dark' | 'light' | 'auto'
  onThemeChange: (theme: 'dark' | 'light' | 'auto') => void
  onOpenShortcuts: () => void
}

const THEME_LABELS: Record<'dark' | 'light' | 'auto', string> = {
  dark: 'Dark',
  light: 'Light',
  auto: 'Auto',
}

export function RightSidebar({
  collapsed,
  onToggleCollapse,
  parameters,
  onParameterChange,
  onResetParameters,
  presets,
  activePresetId,
  onSelectPreset,
  stats,
  theme,
  onThemeChange,
  onOpenShortcuts,
}: RightSidebarProps) {
  const [costExpanded, setCostExpanded] = useState(false)

  const tokensLabel = useMemo(() => formatNumber(stats.totalTokens), [stats.totalTokens])
  const averageLatency = useMemo(() => formatLatency(stats.averageLatency), [stats.averageLatency])
  const estimatedCost = useMemo(() => formatCurrency(stats.estimatedCost), [stats.estimatedCost])


  const handleStopSequenceAdd = (sequence: string) => {
    if (!sequence.trim()) return
    if (parameters.stopSequences.includes(sequence.trim())) return
    if (parameters.stopSequences.length >= 4) return
    onParameterChange('stopSequences', [...parameters.stopSequences, sequence.trim()])
  }

  const removeStopSequence = (sequence: string) => {
    onParameterChange('stopSequences', parameters.stopSequences.filter((item) => item !== sequence))
  }

  return (
    <aside className={`sidebar right-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-top">
        <button type="button" className="sidebar-toggle" onClick={onToggleCollapse} aria-label="Toggle parameters sidebar">
          {collapsed ? '←' : '⚙'}
        </button>
      </div>

      <div className="sidebar-section parameters">
        <div className="section-header">
          <span className="section-title">Parameters</span>
          <button type="button" className="link-button" onClick={onResetParameters}>
            Reset
          </button>
        </div>

        <div className="parameters-body scrollable">
          <ParameterSlider
            label="Temperature"
            info="Controls randomness. Lower values make output more focused."
            min={0}
            max={2}
            step={0.1}
            value={parameters.temperature}
            onChange={(value) => onParameterChange('temperature', value)}
          />

          <ParameterSlider
            label="Max Tokens"
            info="Maximum length of the response."
            min={1}
            max={128000}
            step={1}
            value={parameters.maxTokens}
            onChange={(value) => onParameterChange('maxTokens', Math.round(value))}
            discreteValues={[512, 2048, 4096, 8192, 16384]}
          />

          <ParameterSlider
            label="Top-p"
            info="Nucleus sampling. Controls diversity by limiting selection to top probability mass."
            min={0}
            max={1}
            step={0.05}
            value={parameters.topP}
            onChange={(value) => onParameterChange('topP', parseFloat(value.toFixed(2)))}
          />

          <ParameterSlider
            label="Frequency Penalty"
            info="Reduces likelihood of repeating tokens."
            min={-2}
            max={2}
            step={0.1}
            value={parameters.frequencyPenalty}
            onChange={(value) => onParameterChange('frequencyPenalty', parseFloat(value.toFixed(1)))}
          />

          <ParameterSlider
            label="Presence Penalty"
            info="Encourages discussion of new topics."
            min={-2}
            max={2}
            step={0.1}
            value={parameters.presencePenalty}
            onChange={(value) => onParameterChange('presencePenalty', parseFloat(value.toFixed(1)))}
          />

          <StopSequencesSection
            sequences={parameters.stopSequences}
            onAdd={handleStopSequenceAdd}
            onRemove={removeStopSequence}
          />

          <SwitchRow
            label="Stream response"
            description="Stream tokens as they are generated instead of waiting for completion."
            checked={parameters.stream}
            onChange={(checked) => onParameterChange('stream', checked)}
          />
        </div>
      </div>

      <div className="sidebar-section stats">
        <div className="section-header">
          <span className="section-title">Session Stats</span>
        </div>
        <div className="stats-body">
          <StatCard label="Total Tokens" icon="📊" value={tokensLabel} />
          <StatCard label="Avg Latency" icon="⚡" value={averageLatency} />
          <StatCard label="Est. Cost" icon="💰" value={estimatedCost} variant={stats.estimatedCost > 1 ? 'warning' : undefined} />

          <button type="button" className="cost-breakdown-toggle" onClick={() => setCostExpanded((prev) => !prev)}>
            💰 Cost Breakdown {costExpanded ? '▲' : '▼'}
          </button>
          {costExpanded && (
            <div className="cost-breakdown">
              {Object.entries(stats.perModelCost).map(([modelId, cost]) => (
                <div key={modelId} className="breakdown-row">
                  <span className="breakdown-model">{modelId}</span>
                  <span className="breakdown-cost">{formatCurrency(cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-section presets">
        <div className="section-header">
          <span className="section-title">Parameter Presets</span>
        </div>
        <div className="presets-body scrollable">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-card${preset.id === activePresetId ? ' active' : ''}`}
              onClick={() => onSelectPreset(preset.id)}
            >
              <div className="preset-header">
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-name">{preset.name}</span>
                {preset.id === activePresetId && <span className="preset-check">✓</span>}
              </div>
              <span className="preset-description">{preset.description}</span>
              <div className="preset-metrics">
                <span>Temp: {preset.temperature}</span>
                <span>Max: {formatNumber(preset.maxTokens)}</span>
                <span>Top-p: {preset.topP}</span>
              </div>
            </button>
          ))}
          <button type="button" className="preset-add">
            + Save current as preset
          </button>
        </div>
      </div>

      <div className="sidebar-section system">
        <div className="section-header">
          <span className="section-title">System</span>
        </div>
        <div className="system-body">
          <div className="system-row">
            <span className="system-label">🌙 Theme</span>
            <div className="theme-dropdown">
              <select value={theme} onChange={(event) => onThemeChange(event.target.value as 'dark' | 'light' | 'auto')}>
                {Object.entries(THEME_LABELS).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="system-row shortcuts" onClick={onOpenShortcuts}>
            <span>⌨️ Keyboard Shortcuts</span>
            <span className="shortcut-arrow">→</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

interface ParameterSliderProps {
  label: string
  info: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  discreteValues?: number[]
}

function ParameterSlider({ label, info, min, max, step, value, onChange, discreteValues }: ParameterSliderProps) {
  return (
    <div className="parameter-slider">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-info" title={info}>
          ℹ
        </span>
      </div>
      <div className="slider-input-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          type="number"
          value={Number.isInteger(value) ? value : Number(value.toFixed(2))}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      {discreteValues && (
        <div className="slider-presets">
          {discreteValues.map((item) => (
            <button type="button" key={item} onClick={() => onChange(item)}>
              {formatNumber(item)}
            </button>
          ))}
        </div>
      )}
      <div className="slider-scale">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

interface StopSequencesSectionProps {
  sequences: string[]
  onAdd: (sequence: string) => void
  onRemove: (sequence: string) => void
}

function StopSequencesSection({ sequences, onAdd, onRemove }: StopSequencesSectionProps) {
  const [draft, setDraft] = useState('')

  return (
    <div className="stop-sequences">
      <div className="slider-header">
        <span className="slider-label">Stop sequences</span>
        <span className="slider-info" title="Model will stop when it emits one of these sequences.">
          ℹ
        </span>
      </div>
      <div className="stop-input-row">
        <input
          type="text"
          value={draft}
          placeholder="+ Add stop sequence"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onAdd(draft)
              setDraft('')
            }
          }}
        />
        <button type="button" onClick={() => {
          onAdd(draft)
          setDraft('')
        }}>
          Add
        </button>
      </div>
      <div className="stop-chips">
        {sequences.length === 0 && <span className="stop-empty">No stop sequences</span>}
        {sequences.map((sequence) => (
          <span className="stop-chip" key={sequence}>
            {sequence}
            <button type="button" onClick={() => onRemove(sequence)}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

interface SwitchRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  return (
    <div className="switch-row">
      <div className="switch-labels">
        <span className="switch-title">{label}</span>
        {description && <span className="switch-description">{description}</span>}
      </div>
      <button type="button" className={`switch${checked ? ' checked' : ''}`} onClick={() => onChange(!checked)}>
        <span className="switch-thumb" />
      </button>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: string
  variant?: 'warning' | 'danger'
}

function StatCard({ label, value, icon, variant }: StatCardProps) {
  return (
    <div className={`stat-card${variant ? ` ${variant}` : ''}`}>
      <div className="stat-meta">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
}

function formatLatency(latencyMs: number) {
  if (latencyMs < 1000) {
    return `${latencyMs}ms`
  }
  return `${(latencyMs / 1000).toFixed(1)}s`
}

function formatCurrency(value: number) {
  if (value < 0.01) return '<$0.01'
  return `$${value.toFixed(2)}`
}

export default RightSidebar
