import { useMemo, useState } from 'react'
import type { HistoryItem, ModelSpec, TemplateItem } from '../../types'

interface LeftSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  models: ModelSpec[]
  onToggleModel: (id: string) => void
  selectedModelCount: number
  maxModels?: number
  vaultLocked: boolean
  onToggleVaultLock: () => void
  templates: TemplateItem[]
  onUseTemplate: (template: TemplateItem) => void
  history: HistoryItem[]
  activeSessionId: string | null
  onSelectHistory: (sessionId: string) => void
  onAddModel?: () => void
  onOpenModelMenu?: () => void
  onCreateTemplate?: () => void
}

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Configured', value: 'configured' },
  { label: 'Active', value: 'active' },
]

type FilterValue = (typeof FILTERS)[number]['value']

export function LeftSidebar({
  collapsed,
  onToggleCollapse,
  models,
  onToggleModel,
  selectedModelCount,
  maxModels = 6,
  vaultLocked,
  onToggleVaultLock,
  templates,
  onUseTemplate,
  history,
  activeSessionId,
  onSelectHistory,
  onAddModel,
  onOpenModelMenu,
  onCreateTemplate,
}: LeftSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [templatesCollapsed, setTemplatesCollapsed] = useState(false)
  const [historyCollapsed, setHistoryCollapsed] = useState(false)

  const filteredModels = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return models.filter((model) => {
      const matchesSearch =
        term.length === 0 ||
        model.name.toLowerCase().includes(term) ||
        model.provider.toLowerCase().includes(term)

      if (!matchesSearch) return false

      if (filter === 'configured') return model.apiKeyConfigured
      if (filter === 'active') return model.status === 'active'
      return true
    })
  }, [models, searchTerm, filter])

  const isAtMaxModels = useMemo(
    () => models.filter((model) => model.selected).length >= maxModels,
    [models, maxModels],
  )

  const renderModelStatus = (status: ModelSpec['status']) => {
    switch (status) {
      case 'active':
        return <span className="status-dot active" title="Active" />
      case 'rate-limited':
        return <span className="status-dot warning" title="Rate limited" />
      case 'error':
        return <span className="status-dot error" title="Unavailable" />
      default:
        return <span className="status-dot neutral" title="Inactive" />
    }
  }

  return (
    <aside className={`sidebar left-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-top">
        <button type="button" className="sidebar-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
          {collapsed ? '→' : '☰'}
        </button>

        {!collapsed && (
          <div className="app-logo" role="button" tabIndex={0} aria-label="Reset interface">
            <span className="app-icon">◎</span>
            <div className="app-meta">
              <span className="app-name">Onedot2</span>
              <span className="app-tag">Multi-model workspace</span>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          {!collapsed && <span className="section-title">Active Models</span>}
          <div className="section-actions">
            <button type="button" className="icon-action" onClick={onAddModel} disabled={vaultLocked || isAtMaxModels} title={isAtMaxModels ? 'Maximum models reached' : 'Add model'}>
              +
            </button>
            <button type="button" className="icon-action" onClick={onOpenModelMenu} title="Sort or filter">
              ⋮
            </button>
          </div>
        </div>

        <div className="model-search">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search models..."
            disabled={collapsed}
          />
          {searchTerm && (
            <button type="button" className="clear-search" onClick={() => setSearchTerm('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <div className="filter-row">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`filter-chip${filter === item.value ? ' active' : ''}`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="models-list scrollable">
          {filteredModels.map((model) => {
            const disableToggle = selectedModelCount <= 1 && model.selected
            const tooltip = disableToggle ? 'At least one model must remain selected' : undefined
            return (
              <div key={model.id} className={`model-item${model.selected ? ' selected' : ''}`}>
                <span className="model-accent" style={{ backgroundColor: model.brandColor }} />
                <div className="model-main">
                  <label className="model-checkbox" title={tooltip}>
                    <input
                      type="checkbox"
                      checked={model.selected}
                      disabled={disableToggle || vaultLocked}
                      onChange={() => onToggleModel(model.id)}
                    />
                    <span />
                  </label>
                  <div className="model-details">
                    <div className="model-header">
                      <span className="model-name" title={model.name}>
                        {model.name}
                      </span>
                      {renderModelStatus(model.status)}
                    </div>
                    <div className="model-provider">{model.provider}</div>
                    <div className="model-specs">
                      <span>📊 {model.contextSizeDisplay}</span>
                      <span>⚡ {model.avgLatencyDisplay}</span>
                      <span>💰 {model.costDisplay}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredModels.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <span className="empty-title">No models matched</span>
              <span className="empty-subtitle">Adjust search or filters</span>
            </div>
          )}
        </div>
      </div>

      <div className={`sidebar-section${templatesCollapsed ? ' collapsed' : ''}`}>
        <div className="section-header" onClick={() => setTemplatesCollapsed((prev) => !prev)} role="button">
          <span className="section-title">Templates</span>
          <button type="button" className="icon-action" title="Create template" onClick={(event) => {
            event.stopPropagation()
            onCreateTemplate?.()
          }}>
            +
          </button>
        </div>
        {!templatesCollapsed && (
          <div className="templates-list scrollable">
            {templates.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <span className="empty-title">No templates yet</span>
                <span className="empty-subtitle">Create your first template</span>
              </div>
            )}
            {templates.map((template) => (
              <div key={template.id} className="template-item">
                <div className="template-meta">
                  <span className="template-name" title={template.name}>
                    📝 {template.name}
                  </span>
                  <span className="template-preview">{template.content.replace(/\s+/g, ' ').slice(0, 60)}...</span>
                  <span className="template-stats">
                    {template.variables.length} vars • {template.charCount} chars
                  </span>
                </div>
                <button type="button" className="template-use" onClick={() => onUseTemplate(template)}>
                  Use
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`sidebar-section history${historyCollapsed ? ' collapsed' : ''}`}>
        <div className="section-header" onClick={() => setHistoryCollapsed((prev) => !prev)} role="button">
          <span className="section-title">History</span>
          <button type="button" className="icon-action" title="History settings" onClick={(event) => {
            event.stopPropagation()
          }}>
            ⋮
          </button>
        </div>

        {!historyCollapsed && (
          <div className="history-list scrollable">
            {history.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <span className="empty-title">No history yet</span>
                <span className="empty-subtitle">Start a conversation</span>
              </div>
            )}

            {history.map((item) => (
              <button
                key={item.sessionId}
                type="button"
                className={`history-item${item.sessionId === activeSessionId ? ' active' : ''}`}
                onClick={() => onSelectHistory(item.sessionId)}
              >
                <span className="history-title" title={item.title}>
                  {item.title}
                </span>
                <div className="history-meta">
                  <span>🤖 {item.modelIds.length}</span>
                  <span>💬 {item.turnCount}</span>
                </div>
                <div className="history-colors" aria-hidden>
                  {item.modelColors.slice(0, 6).map((color, index) => (
                    <span className="color-block" style={{ backgroundColor: color }} key={`${item.sessionId}-${index}`} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="vault-status">
        <div className="vault-meta">
          <span className={`vault-icon ${vaultLocked ? 'locked' : 'unlocked'}`}>{vaultLocked ? '🔒' : '🔓'}</span>
          <div className="vault-text">
            <span className={`vault-title ${vaultLocked ? 'locked' : 'unlocked'}`}>{vaultLocked ? 'Vault Locked' : 'Vault Unlocked'}</span>
            <span className="vault-subtitle">API keys encrypted locally</span>
          </div>
        </div>
        <button type="button" className="vault-action" onClick={onToggleVaultLock}>
          {vaultLocked ? 'Unlock' : 'Lock'}
        </button>
      </div>
    </aside>
  )
}

export default LeftSidebar
