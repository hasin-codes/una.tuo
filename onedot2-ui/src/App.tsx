import { useEffect, useMemo, useRef, useState } from 'react'
import LeftSidebar from './components/LeftSidebar/LeftSidebar'
import ModelColumn from './components/Workspace/ModelColumn'
import PromptComposer, { type CostBreakdownItem } from './components/PromptComposer/PromptComposer'
import RightSidebar from './components/RightSidebar/RightSidebar'
import { defaultSessionStats, historyItems as initialHistory, initialModels, presets as presetOptions, templateItems } from './data/mockData'
import type { HistoryItem, ModelSpec, ModelVersion, PromptAttachment, TemplateItem } from './types'
import './App.css'

interface ParametersState {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  stream: boolean
}

const INITIAL_PARAMETERS: ParametersState = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stopSequences: [],
  stream: true,
}

const MIN_COLUMN_WIDTH_PX = 320

function App() {
  const [models, setModels] = useState<ModelSpec[]>(initialModels)
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [vaultLocked, setVaultLocked] = useState(false)
  const [promptValue, setPromptValue] = useState('')
  const [attachments, setAttachments] = useState<PromptAttachment[]>([])
  const [keepPrompt, setKeepPrompt] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [contextCount, setContextCount] = useState(0)
  const [parameters, setParameters] = useState<ParametersState>(INITIAL_PARAMETERS)
  const [activePresetId, setActivePresetId] = useState(presetOptions[0]?.id ?? '')
  const [sessionStats, setSessionStats] = useState(defaultSessionStats)
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialHistory[0]?.sessionId ?? null)
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down' | null>>({})
  const [activeVersions, setActiveVersions] = useState<Record<string, string>>(() => (
    Object.fromEntries(initialModels.map((model) => [model.id, model.versions[0]?.versionId ?? '']))
  ))
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const selectedModels = initialModels.filter((model) => model.selected)
    const count = selectedModels.length || 1
    const perColumn = 100 / count
    return Object.fromEntries(selectedModels.map((model) => [model.id, perColumn]))
  })
  const [resizeState, setResizeState] = useState<null | {
    leftId: string
    rightId: string
    startX: number
    leftWidth: number
    rightWidth: number
    containerWidth: number
  }>(null)
  const [streamingModels, setStreamingModels] = useState<Record<string, boolean>>({})

  const columnsAreaRef = useRef<HTMLDivElement | null>(null)

  const selectedModels = useMemo(
    () => models.filter((model) => model.selected).sort((a, b) => a.order - b.order),
    [models],
  )

  useEffect(() => {
    const count = selectedModels.length || 1
    const existingWidths = columnWidths
    const base = 100 / count
    const updated: Record<string, number> = {}

    selectedModels.forEach((model) => {
      updated[model.id] = existingWidths[model.id] ?? base
    })

    // normalise to 100
    const total = Object.values(updated).reduce((sum, width) => sum + width, 0)
    const factor = total === 0 ? 1 : 100 / total
    const normalised = Object.fromEntries(
      Object.entries(updated).map(([key, width]) => [key, width * factor]),
    )

    setColumnWidths((prev) => ({ ...prev, ...normalised }))
  }, [selectedModels.length])

  useEffect(() => {
    if (!resizeState) return

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault()
      if (!columnsAreaRef.current) return

      const deltaPx = event.clientX - resizeState.startX
      const deltaPercent = (deltaPx / resizeState.containerWidth) * 100
      const minPercent = (MIN_COLUMN_WIDTH_PX / resizeState.containerWidth) * 100

      let nextLeft = resizeState.leftWidth + deltaPercent
      let nextRight = resizeState.rightWidth - deltaPercent

      if (nextLeft < minPercent) {
        const diff = minPercent - nextLeft
        nextLeft = minPercent
        nextRight -= diff
      }

      if (nextRight < minPercent) {
        const diff = minPercent - nextRight
        nextRight = minPercent
        nextLeft -= diff
      }

      if (nextLeft <= minPercent || nextRight <= minPercent) return

      setColumnWidths((prev) => ({
        ...prev,
        [resizeState.leftId]: nextLeft,
        [resizeState.rightId]: nextRight,
      }))
    }

    const handleMouseUp = () => {
      document.body.classList.remove('resizing')
      setResizeState(null)
    }

    document.body.classList.add('resizing')
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.classList.remove('resizing')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizeState])

  const handleResizeStart = (leftId: string, rightId: string, clientX: number) => {
    const container = columnsAreaRef.current
    if (!container) return
    setResizeState({
      leftId,
      rightId,
      startX: clientX,
      leftWidth: columnWidths[leftId] ?? 0,
      rightWidth: columnWidths[rightId] ?? 0,
      containerWidth: container.getBoundingClientRect().width,
    })
  }

  const handleToggleModel = (id: string) => {
    setModels((prev) => {
      const selectedCount = prev.filter((model) => model.selected).length
      return prev.map((model) => {
        if (model.id !== id) return model
        if (model.selected && selectedCount <= 1) return model
        if (!model.selected) {
          return { ...model, selected: true }
        }
        return { ...model, selected: false }
      })
    })
  }

  const handleUseTemplate = (template: TemplateItem) => {
    setPromptValue(template.content)
  }

  const handleAddAttachments = (files: FileList) => {
    const newAttachments: PromptAttachment[] = Array.from(files)
      .slice(0, Math.max(0, 5 - attachments.length))
      .map((file) => ({
        id: crypto.randomUUID?.() ?? `${file.name}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: inferAttachmentType(file.type),
      }))

    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  const charLimit = useMemo(() => {
    if (selectedModels.length === 0) return 32000
    return Math.min(...selectedModels.map((model) => model.contextSize))
  }, [selectedModels])

  const characterUsage = promptValue.length

  const estimatedTokens = useMemo(() => {
    const baseTokens = Math.max(1, Math.round(characterUsage / 4))
    const attachmentTokens = attachments.reduce((sum, attachment) => sum + Math.ceil(attachment.size / 512), 0)
    return baseTokens + attachmentTokens
  }, [characterUsage, attachments])

  const costBreakdown: CostBreakdownItem[] = useMemo(() => {
    return selectedModels.map((model) => ({
      model: model.name,
      cost: (estimatedTokens / 1000) * model.costPer1KTokens,
    }))
  }, [selectedModels, estimatedTokens])

  const costEstimate = costBreakdown.reduce((sum, item) => sum + item.cost, 0)

  const handleSendPrompt = () => {
    const prompt = promptValue.trim()
    if (!prompt || vaultLocked || selectedModels.length === 0) return

    const timestamp = new Date().toISOString()
    const newVersions = new Map<string, ModelVersion>()

    selectedModels.forEach((model) => {
      const lastVersion = model.versions[model.versions.length - 1]
      const newVersion = createMockVersion(model, prompt, lastVersion?.versionNumber ?? 0, timestamp)
      newVersions.set(model.id, newVersion)
    })

    setIsSending(true)

    setModels((prev) => prev.map((model) => {
      const newVersion = newVersions.get(model.id)
      if (!newVersion) return model
      return { ...model, versions: [...model.versions, newVersion] }
    }))

    setActiveVersions((prev) => {
      const updated = { ...prev }
      newVersions.forEach((version, modelId) => {
        updated[modelId] = version.versionId
      })
      return updated
    })

    setStreamingModels((prev) => {
      const updated = { ...prev }
      newVersions.forEach((_version, modelId) => {
        updated[modelId] = true
      })
      return updated
    })

    setTimeout(() => {
      setStreamingModels((prev) => {
        const updated = { ...prev }
        newVersions.forEach((_version, modelId) => {
          updated[modelId] = false
        })
        return updated
      })
      setIsSending(false)
    }, 1200)

    setSessionStats((prev) => {
      const totalNewTokens = Array.from(newVersions.values()).reduce((sum, version) => sum + version.tokens.total, 0)
      const updatedCosts = { ...prev.perModelCost }
      newVersions.forEach((version, modelId) => {
        updatedCosts[modelId] = (updatedCosts[modelId] ?? 0) + version.costUsd
      })
      return {
        totalTokens: prev.totalTokens + totalNewTokens,
        averageLatency: prev.averageLatency,
        estimatedCost: prev.estimatedCost + Array.from(newVersions.values()).reduce((sum, version) => sum + version.costUsd, 0),
        perModelCost: updatedCosts,
      }
    })

    const newHistory: HistoryItem = {
      sessionId: crypto.randomUUID?.() ?? `session-${Date.now()}`,
      title: prompt.slice(0, 48) || 'New conversation',
      timestamp,
      lastModified: timestamp,
      modelIds: selectedModels.map((model) => model.id),
      modelColors: selectedModels.map((model) => model.brandColor),
      turnCount: 1,
      summary: prompt.slice(0, 120),
    }

    setHistory((prev) => [newHistory, ...prev])
    setActiveSessionId(newHistory.sessionId)
    setContextCount((previous) => previous + 1)

    if (!keepPrompt) {
      setPromptValue('')
      setAttachments([])
    }
  }

  const handleSelectVersion = (modelId: string, versionId: string) => {
    setActiveVersions((prev) => ({ ...prev, [modelId]: versionId }))
  }

  const handleAddVersion = (modelId: string) => {
    const target = models.find((model) => model.id === modelId)
    if (!target) return
    const lastVersion = target.versions[target.versions.length - 1]
    const newVersion = createMockVersion(target, promptValue || 'Follow-up prompt', lastVersion?.versionNumber ?? 0, new Date().toISOString())

    setModels((prev) => prev.map((model) => {
      if (model.id !== modelId) return model
      return { ...model, versions: [...model.versions, newVersion] }
    }))

    setActiveVersions((prev) => ({ ...prev, [modelId]: newVersion.versionId }))
  }

  const handleRegenerate = (modelId: string) => {
    const target = models.find((model) => model.id === modelId)
    if (!target) return
    const lastVersion = target.versions[target.versions.length - 1]
    const newVersion = createMockVersion(target, promptValue || 'Regenerated prompt', lastVersion?.versionNumber ?? 0, new Date().toISOString())

    setModels((prev) => prev.map((model) => {
      if (model.id !== modelId) return model
      return { ...model, versions: [...model.versions, newVersion] }
    }))

    setActiveVersions((prev) => ({ ...prev, [modelId]: newVersion.versionId }))
  }

  const handleCopyVersion = () => {
    // no-op for now, clipboard handled in column
  }

  const handleExportVersion = (modelId: string, versionId: string, format: 'txt' | 'md' | 'json') => {
    const model = models.find((item) => item.id === modelId)
    const version = model?.versions.find((item) => item.versionId === versionId)
    if (!model || !version) return

    let content = version.response
    let mime = 'text/plain'
    let extension = format

    if (format === 'json') {
      content = JSON.stringify({
        model: model.name,
        version: version.versionNumber,
        timestamp: version.timestamp,
        response: version.response,
        tokens: version.tokens,
        latency: version.latencyMs,
        cost: version.costUsd,
      }, null, 2)
      mime = 'application/json'
    }

    if (format === 'md') {
      mime = 'text/markdown'
    }

    const blob = new Blob([content], { type: mime })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${model.name.replace(/\s+/g, '-')}-v${version.versionNumber}-${new Date(version.timestamp).toISOString()}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  }

  const handleRate = (modelId: string, versionId: string, value: 'up' | 'down' | null) => {
    setRatings((prev) => ({ ...prev, [`${modelId}:${versionId}`]: value }))
  }

  const handleResetParameters = () => {
    setParameters(INITIAL_PARAMETERS)
    setActivePresetId(presetOptions[0]?.id ?? '')
  }

  const handleApplyPreset = (presetId: string) => {
    const preset = presetOptions.find((item) => item.id === presetId)
    if (!preset) return
    setParameters({
      temperature: preset.temperature,
      maxTokens: preset.maxTokens,
      topP: preset.topP,
      frequencyPenalty: preset.frequencyPenalty,
      presencePenalty: preset.presencePenalty,
      stopSequences: [],
      stream: preset.stream,
    })
    setActivePresetId(presetId)
  }

  const handleToggleVault = () => {
    setVaultLocked((prev) => !prev)
  }

  const handleClearContext = () => {
    setContextCount(0)
  }

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPromptValue((prev) => `${prev}\n${text}`.trim())
    } catch (error) {
      console.error('Clipboard unavailable', error)
    }
  }

  const handleLinkDocument = () => {
    const url = window.prompt('Paste document link')
    if (!url) return
    setPromptValue((prev) => `${prev}\n\n[Linked document](${url})`)
  }

  const handleAddSystemPrompt = () => {
    const systemPrompt = window.prompt('Enter system prompt instructions')
    if (!systemPrompt) return
    setPromptValue((prev) => `System: ${systemPrompt}\n${prev}`)
  }

  const handleThemeChange = (nextTheme: 'dark' | 'light' | 'auto') => {
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  return (
    <div className={`app-shell${leftCollapsed ? ' left-collapsed' : ''}${rightCollapsed ? ' right-collapsed' : ''}`}>
      <LeftSidebar
        collapsed={leftCollapsed}
        onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
        models={models}
        onToggleModel={handleToggleModel}
        selectedModelCount={selectedModels.length}
        vaultLocked={vaultLocked}
        onToggleVaultLock={handleToggleVault}
        templates={templateItems}
        onUseTemplate={handleUseTemplate}
        history={history}
        activeSessionId={activeSessionId}
        onSelectHistory={setActiveSessionId}
        onCreateTemplate={() => window.alert('Template creation coming soon')}
      />

      <main className="center-workspace">
        <div className="columns-area" ref={columnsAreaRef}>
          <div className="columns-scroll scrollable">
            <div className="columns-wrapper">
              {selectedModels.map((model, index) => (
                <ModelColumn
                  key={model.id}
                  model={model}
                  activeVersionId={activeVersions[model.id] ?? model.versions[0]?.versionId ?? ''}
                  onSelectVersion={handleSelectVersion}
                  onAddVersion={handleAddVersion}
                  onRegenerate={handleRegenerate}
                  onCopyVersion={handleCopyVersion}
                  onExportVersion={handleExportVersion}
                  rating={ratings[`${model.id}:${activeVersions[model.id] ?? ''}`] ?? null}
                  onRate={handleRate}
                  widthPercentage={columnWidths[model.id] ?? 100 / selectedModels.length}
                  onResizeStart={handleResizeStart}
                  nextModelId={selectedModels[index + 1]?.id}
                  isStreaming={!!streamingModels[model.id]}
                />
              ))}
            </div>
          </div>
        </div>

        <PromptComposer
          value={promptValue}
          onChange={setPromptValue}
          onSend={handleSendPrompt}
          attachments={attachments}
          onAddAttachments={handleAddAttachments}
          onRemoveAttachment={handleRemoveAttachment}
          keepPrompt={keepPrompt}
          onToggleKeepPrompt={() => setKeepPrompt((prev) => !prev)}
          charLimit={charLimit}
          characterUsage={characterUsage}
          costEstimate={costEstimate}
          costBreakdown={costBreakdown}
          vaultLocked={vaultLocked}
          isSending={isSending}
          contextCount={contextCount}
          onClearContext={handleClearContext}
          onOpenTemplates={() => window.alert('Template library coming soon')}
          onPasteClipboard={handlePasteClipboard}
          onLinkDocument={handleLinkDocument}
          onAddSystemPrompt={handleAddSystemPrompt}
        />
      </main>

      <RightSidebar
        collapsed={rightCollapsed}
        onToggleCollapse={() => setRightCollapsed((prev) => !prev)}
        parameters={parameters}
        onParameterChange={(key, value) => setParameters((prev) => ({ ...prev, [key]: value }))}
        onResetParameters={handleResetParameters}
        presets={presetOptions}
        activePresetId={activePresetId}
        onSelectPreset={handleApplyPreset}
        stats={sessionStats}
        theme={theme}
        onThemeChange={handleThemeChange}
        onOpenShortcuts={() => window.alert('Shortcut sheet coming soon')}
      />
    </div>
  )
}

function inferAttachmentType(mime: string): PromptAttachment['type'] {
  if (mime.startsWith('image/')) return 'image'
  if (mime.includes('csv') || mime.includes('excel') || mime.includes('sheet')) return 'data'
  if (mime.includes('javascript') || mime.includes('python') || mime.includes('json')) return 'code'
  return 'text'
}

function createMockVersion(model: ModelSpec, prompt: string, lastVersionNumber: number, timestamp: string): ModelVersion {
  const nextNumber = lastVersionNumber + 1
  const tokensInput = Math.max(48, Math.round(prompt.length / 4))
  const tokensOutput = 600 + Math.round(Math.random() * 400)
  const totalTokens = tokensInput + tokensOutput
  const latency = 1500 + Math.round(Math.random() * 1200)
  const cost = (totalTokens / 1000) * model.costPer1KTokens

  const response = `# ${model.name} • Response v${nextNumber}\n\n## Prompt recap\n> ${prompt}\n\n## Key insights\n- Summary generated for version ${nextNumber}.\n- Total tokens: **${totalTokens}**.\n- Model latency: ~${formatLatency(latency)}.\n\n## Recommendations\n1. Validate outputs against ground truth.\n2. Share learnings with the evaluation squad.\n3. Capture decisions in the comparison log.\n`

  return {
    versionId: `${model.id}-v${nextNumber}-${Date.now()}`,
    versionNumber: nextNumber,
    timestamp,
    response,
    tokens: {
      input: tokensInput,
      output: tokensOutput,
      total: totalTokens,
    },
    latencyMs: latency,
    costUsd: Number(cost.toFixed(3)),
  }
}

function formatLatency(latency: number) {
  if (latency < 1000) {
    return `${latency}ms`
  }
  return `${(latency / 1000).toFixed(1)}s`
}

export default App
