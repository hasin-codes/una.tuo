import { useEffect, useMemo, useRef, useState } from 'react'
import type { PromptAttachment } from '../../types'

export interface CostBreakdownItem {
  model: string
  cost: number
}

interface PromptComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  attachments: PromptAttachment[]
  onAddAttachments: (files: FileList) => void
  onRemoveAttachment: (id: string) => void
  keepPrompt: boolean
  onToggleKeepPrompt: () => void
  charLimit: number
  characterUsage: number
  costEstimate: number
  costBreakdown: CostBreakdownItem[]
  vaultLocked: boolean
  lockedMessage?: string
  isSending: boolean
  contextCount: number
  onClearContext: () => void
  onOpenTemplates: () => void
  onPasteClipboard: () => void
  onLinkDocument: () => void
  onAddSystemPrompt: () => void
}

const COST_WARNING_THRESHOLD = 0.1
const COST_DANGER_THRESHOLD = 1
const CHAR_WARNING_THRESHOLD = 0.8
const CHAR_DANGER_THRESHOLD = 0.95

export function PromptComposer({
  value,
  onChange,
  onSend,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  keepPrompt,
  onToggleKeepPrompt,
  charLimit,
  characterUsage,
  costEstimate,
  costBreakdown,
  vaultLocked,
  lockedMessage = 'Unlock vault to continue',
  isSending,
  contextCount,
  onClearContext,
  onOpenTemplates,
  onPasteClipboard,
  onLinkDocument,
  onAddSystemPrompt,
}: PromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const trimmedValue = value.trim()
  const isSendDisabled = !trimmedValue || vaultLocked || isSending

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const maxHeight = 224
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [value])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.composer-context-menu') && !target.closest('.composer-icon-button.context')) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      window.addEventListener('mousedown', handleClick)
      return () => window.removeEventListener('mousedown', handleClick)
    }
  }, [showContextMenu])

  const characterRatio = charLimit > 0 ? characterUsage / charLimit : 0

  const characterIndicatorClass = useMemo(() => {
    if (characterRatio >= CHAR_DANGER_THRESHOLD) return 'danger'
    if (characterRatio >= CHAR_WARNING_THRESHOLD) return 'warning'
    return 'normal'
  }, [characterRatio])

  const costIndicatorClass = useMemo(() => {
    if (costEstimate >= COST_DANGER_THRESHOLD) return 'danger'
    if (costEstimate >= COST_WARNING_THRESHOLD) return 'warning'
    return 'normal'
  }, [costEstimate])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length) {
      onAddAttachments(files)
      event.target.value = ''
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isSendDisabled) {
        onSend()
      }
    }
  }

  const characterLabel = useMemo(() => {
    if (charLimit >= 1000) {
      const current = characterUsage >= 1000 ? `${(characterUsage / 1000).toFixed(1)}K` : characterUsage
      return `${current} / ${(charLimit / 1000).toFixed(0)}K`
    }
    return `${characterUsage} / ${charLimit}`
  }, [characterUsage, charLimit])

  const estimatedCostLabel = useMemo(() => {
    if (costEstimate === 0) return '$0.00'
    if (costEstimate < 0.01) return '<$0.01'
    return `$${costEstimate.toFixed(2)}`
  }, [costEstimate])

  return (
    <div className={`prompt-composer${vaultLocked ? ' locked' : ''}`}> 
      {contextCount > 0 && (
        <div className="composer-context-bar">
          <span className="composer-context-label">Context: {contextCount} {contextCount === 1 ? 'message' : 'messages'}</span>
          <button type="button" className="context-clear" onClick={onClearContext}>
            ✕
          </button>
        </div>
      )}

      <div className={`composer-options${isFocused || value.length > 0 ? ' visible' : ''}`}>
        <label className="keep-prompt-toggle">
          <input type="checkbox" checked={keepPrompt} onChange={onToggleKeepPrompt} />
          <span>Keep prompt</span>
        </label>

        <div className="option-metrics">
          <span className={`character-counter ${characterIndicatorClass}`} title={`Max characters derived from smallest context window.`}>
            {characterLabel}
          </span>
          <span className={`cost-estimate ${costIndicatorClass}`} title={costBreakdown.map((item) => `${item.model}: ~$${item.cost.toFixed(2)}`).join('\n')}>
            ~{estimatedCostLabel}
          </span>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="composer-attachments scrollable">
          {attachments.map((attachment) => (
            <div className={`attachment-chip type-${attachment.type}`} key={attachment.id}>
              <span className="chip-icon" aria-hidden>
                {attachment.type === 'text' && '📄'}
                {attachment.type === 'image' && '🖼️'}
                {attachment.type === 'code' && '💾'}
                {attachment.type === 'data' && '📊'}
              </span>
              <span className="chip-name" title={attachment.name}>
                {attachment.name}
              </span>
              <span className="chip-size">{formatBytes(attachment.size)}</span>
              <button type="button" className="chip-remove" onClick={() => onRemoveAttachment(attachment.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`composer-input-surface${isFocused ? ' focused' : ''}`}>
        <div className="composer-left-icons">
          <button
            type="button"
            className="composer-icon-button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach files"
          >
            📎
          </button>
          <button
            type="button"
            className="composer-icon-button context"
            aria-haspopup="true"
            aria-expanded={showContextMenu}
            onClick={() => setShowContextMenu((prev) => !prev)}
            aria-label="Add context"
          >
            +
          </button>

          {showContextMenu && (
            <div className="composer-context-menu">
              <button type="button" onClick={onPasteClipboard}>
                📋 Paste from clipboard
              </button>
              <button type="button" onClick={onOpenTemplates}>
                📝 Select from templates
              </button>
              <button type="button" onClick={onLinkDocument}>
                🔗 Link external document
              </button>
              <button type="button" onClick={onAddSystemPrompt}>
                ⚙️ Add system prompt
              </button>
            </div>
          )}
        </div>

        <div className="composer-textarea-wrapper">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={charLimit > 0 ? charLimit + 1000 : undefined}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            hidden
          />
        </div>

        <button
          type="button"
          className={`composer-send-button${isSendDisabled ? ' disabled' : ''}${isSending ? ' loading' : ''}`}
          onClick={onSend}
          disabled={isSendDisabled}
          aria-label="Send prompt"
        >
          {isSending ? (
            <span className="spinner" aria-hidden />
          ) : (
            <span aria-hidden>▶</span>
          )}
        </button>
      </div>

      {vaultLocked && (
        <div className="composer-lock-overlay">
          <div className="lock-message">
            <span className="lock-icon">🔒</span>
            <span>{lockedMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

export default PromptComposer
