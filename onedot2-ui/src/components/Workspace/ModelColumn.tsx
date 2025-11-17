import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ModelSpec, ModelVersion } from '../../types'

interface ModelColumnProps {
  model: ModelSpec
  activeVersionId: string
  onSelectVersion: (modelId: string, versionId: string) => void
  onAddVersion: (modelId: string) => void
  onRegenerate: (modelId: string) => void
  onCopyVersion: (modelId: string, versionId: string, text: string) => void
  onExportVersion: (modelId: string, versionId: string, format: 'txt' | 'md' | 'json') => void
  rating: 'up' | 'down' | null
  onRate: (modelId: string, versionId: string, rating: 'up' | 'down' | null) => void
  widthPercentage: number
  onResizeStart?: (leftModelId: string, rightModelId: string, clientX: number) => void
  nextModelId?: string
  isStreaming?: boolean
}

export function ModelColumn({
  model,
  activeVersionId,
  onSelectVersion,
  onAddVersion,
  onRegenerate,
  onCopyVersion,
  onExportVersion,
  rating,
  onRate,
  widthPercentage,
  onResizeStart,
  nextModelId,
  isStreaming,
}: ModelColumnProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [showTopShade, setShowTopShade] = useState(false)
  const [showBottomShade, setShowBottomShade] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copySuccessVersion, setCopySuccessVersion] = useState<string | null>(null)

  const activeVersion = useMemo(() => model.versions.find((version) => version.versionId === activeVersionId) ?? model.versions[0], [model.versions, activeVersionId])

  useEffect(() => {
    const container = bodyRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowTopShade(scrollTop > 20)
      setShowBottomShade(scrollTop + clientHeight < scrollHeight - 20)
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [activeVersionId])

  useEffect(() => {
    if (!copySuccessVersion) return
    const timeout = window.setTimeout(() => setCopySuccessVersion(null), 1200)
    return () => window.clearTimeout(timeout)
  }, [copySuccessVersion])

  const handleCopy = async (version: ModelVersion) => {
    try {
      await navigator.clipboard.writeText(version.response)
      setCopySuccessVersion(version.versionId)
      onCopyVersion(model.id, version.versionId, version.response)
    } catch (error) {
      console.error('Unable to copy response', error)
    }
  }

  const handleExport = (format: 'txt' | 'md' | 'json') => {
    onExportVersion(model.id, activeVersion.versionId, format)
    setShowMenu(false)
  }

  const formattedTokens = useMemo(() => formatTokens(activeVersion.tokens.total), [activeVersion.tokens.total])
  const formattedLatency = useMemo(() => formatLatency(activeVersion.latencyMs), [activeVersion.latencyMs])
  const formattedCost = useMemo(() => `$${activeVersion.costUsd.toFixed(2)}`, [activeVersion.costUsd])

  return (
    <div className="model-column" style={{ flexBasis: `${widthPercentage}%`, borderLeftColor: model.brandColor }}>
      <header className="column-header">
        <div className="column-identity">
          <div className="provider-avatar" style={{ borderColor: model.brandColor }} aria-hidden>
            {model.name.slice(0, 2)}
          </div>
          <div className="identity-text">
            <span className="model-label">{model.name}</span>
            <div className="metrics-row">
              <span>⚡ {formattedLatency}</span>
              <span>💰 {formattedCost}</span>
            </div>
          </div>
        </div>
        <div className="column-actions">
          <button type="button" className="header-action" onClick={() => onRegenerate(model.id)} title="Regenerate response">
            ↻
          </button>
          <button type="button" className={`header-action${copySuccessVersion === activeVersion.versionId ? ' success' : ''}`} onClick={() => handleCopy(activeVersion)} title="Copy response">
            {copySuccessVersion === activeVersion.versionId ? '✓' : '📋'}
          </button>
          <button type="button" className={`header-action${showMenu ? ' active' : ''}`} onClick={() => setShowMenu((prev) => !prev)} title="More actions">
            ⋮
          </button>
          {showMenu && (
            <div className="column-menu">
              <button type="button" onClick={() => onAddVersion(model.id)}>
                + New version
              </button>
              <button type="button" onClick={() => handleExport('txt')}>
                ↓ Download as .txt
              </button>
              <button type="button" onClick={() => handleExport('md')}>
                ↓ Download as .md
              </button>
              <button type="button" onClick={() => handleExport('json')}>
                ↓ Download as .json
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="version-tabs">
        <div className="tabs-scroll scrollable">
          {model.versions.map((version) => (
            <button
              key={version.versionId}
              type="button"
              className={`version-tab${version.versionId === activeVersionId ? ' current' : ''}`}
              onClick={() => onSelectVersion(model.id, version.versionId)}
              style={{ borderBottomColor: model.brandColor }}
            >
              v{version.versionNumber}
            </button>
          ))}
          <button type="button" className="version-tab add" onClick={() => onAddVersion(model.id)}>
            +
          </button>
        </div>
      </div>

      <div className="response-wrapper">
        <div className={`scroll-indicator top${showTopShade ? ' visible' : ''}`} />
        <div className={`scroll-indicator bottom${showBottomShade ? ' visible' : ''}`} />
        <div ref={bodyRef} className="response-body scrollable">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }: any) {
                const language = /language-(\w+)/.exec(className ?? '')?.[1]
                if (inline || !language) {
                  return (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  )
                }
                return (
                  <div className="code-block">
                    <div className="code-header">
                      <span className="code-language">{language}</span>
                      <button type="button" onClick={() => navigator.clipboard.writeText(String(children))}>
                        📋
                      </button>
                    </div>
                    <SyntaxHighlighter language={language} style={coldarkDark} PreTag="div">
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                )
              },
              table({ children }) {
                return <table className="markdown-table">{children}</table>
              },
              th({ children }) {
                return <th>{children}</th>
              },
              td({ children }) {
                return <td>{children}</td>
              },
            }}
          >
            {activeVersion.response}
          </ReactMarkdown>
          {isStreaming && (
            <div className="streaming-indicator">
              Generating response
              <span className="dot dot-1">●</span>
              <span className="dot dot-2">●</span>
              <span className="dot dot-3">●</span>
            </div>
          )}
        </div>
      </div>

      <footer className="column-footer">
        <div className="footer-actions">
          <button
            type="button"
            className={`rating-button${rating === 'up' ? ' active' : ''}`}
            onClick={() => onRate(model.id, activeVersion.versionId, rating === 'up' ? null : 'up')}
            title="Helpful response"
          >
            👍
          </button>
          <button
            type="button"
            className={`rating-button${rating === 'down' ? ' active' : ''}`}
            onClick={() => onRate(model.id, activeVersion.versionId, rating === 'down' ? null : 'down')}
            title="Needs improvement"
          >
            👎
          </button>
        </div>

        <div className="footer-metrics" title={`Input: ${activeVersion.tokens.input} • Output: ${activeVersion.tokens.output}`}>
          <span>📊 {formattedTokens} tokens</span>
        </div>

        <div className="footer-export">
          <button type="button" className="export-button" onClick={() => setShowMenu((prev) => !prev)}>
            ↓ Export
          </button>
        </div>
      </footer>

      {onResizeStart && nextModelId && (
        <div
          className="resize-handle"
          onMouseDown={(event) => onResizeStart(model.id, nextModelId, event.clientX)}
          role="presentation"
        />
      )}
    </div>
  )
}

function formatTokens(total: number) {
  if (total < 1000) return total.toString()
  if (total < 10000) return `${(total / 1000).toFixed(1)}K`
  return `${Math.round(total / 1000)}K`
}

function formatLatency(latencyMs: number) {
  if (latencyMs < 1000) {
    return `${latencyMs}ms`
  }
  return `${(latencyMs / 1000).toFixed(1)}s`
}

export default ModelColumn
