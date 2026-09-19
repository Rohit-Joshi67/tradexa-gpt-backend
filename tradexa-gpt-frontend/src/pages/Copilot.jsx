import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Link } from 'react-router-dom'
import { Bot, Plus, Trash2, Send, AlertTriangle, ShieldCheck, FileSearch, Scale, MessageSquare } from 'lucide-react'
import {
  listConversations, getMessages, deleteConversation,
  getQuota, leakReport, preTrade, streamChat,
} from '../api/copilot'
import { apiErrorMessage } from '../api/client'

function renderMarkdown(text) {
  if (!text) return ''
  return DOMPurify.sanitize(marked.parse(text, { breaks: true }))
}

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'leaks', label: 'Leak Report', icon: FileSearch },
  { id: 'pretrade', label: 'Pre-Trade Check', icon: Scale },
]

export default function Copilot() {
  const [tab, setTab] = useState('chat')
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [chatError, setChatError] = useState('')
  const [quota, setQuota] = useState(null)
  const [unconfigured, setUnconfigured] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const abortRef = useRef(null)
  const bottomRef = useRef(null)

  // Leak report state
  const [leak, setLeak] = useState(null)
  const [leakLoading, setLeakLoading] = useState(false)
  const [leakError, setLeakError] = useState('')

  // Pre-trade state
  const [ptForm, setPtForm] = useState({
    symbol: '', side: 'LONG', entry: '', stop: '', target: '',
    quantity: '', accountSize: '', maxRiskPct: '1',
  })
  const [ptResult, setPtResult] = useState(null)
  const [ptLoading, setPtLoading] = useState(false)
  const [ptError, setPtError] = useState('')

  const refreshQuota = useCallback(() => {
    getQuota().then(setQuota).catch(() => {})
  }, [])

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true)
    try {
      const rows = await listConversations()
      setConversations(rows || [])
    } catch {
      setConversations([])
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
    refreshQuota()
  }, [loadConversations, refreshQuota])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = useCallback(async (id) => {
    abortRef.current?.abort()
    setStreaming(false)
    setActiveId(id)
    setChatError('')
    if (id == null) {
      setMessages([])
      return
    }
    try {
      const rows = await getMessages(id)
      setMessages(rows || [])
    } catch (err) {
      setChatError(apiErrorMessage(err))
      setMessages([])
    }
  }, [])

  const handleNewChat = useCallback(async () => {
    abortRef.current?.abort()
    setStreaming(false)
    setActiveId(null)
    setMessages([])
    setChatError('')
    setInput('')
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this conversation?')) return
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeId === id) handleNewChat()
    } catch (err) {
      setChatError(apiErrorMessage(err))
    }
  }, [activeId, handleNewChat])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    setChatError('')
    setStreaming(true)

    const userMsg = { id: `local-${Date.now()}`, role: 'USER', content: text }
    const assistantMsg = { id: `stream-${Date.now()}`, role: 'ASSISTANT', content: '' }
    setMessages((prev) => [...prev, userMsg, assistantMsg])

    const controller = new AbortController()
    abortRef.current = controller
    let streamedText = ''

    try {
      await streamChat({
        conversationId: activeId,
        message: text,
        signal: controller.signal,
        onConversation: (id) => {
          const numericId = Number(id)
          setActiveId(numericId)
          // Refresh the sidebar so the new conversation appears.
          listConversations().then((rows) => setConversations(rows || [])).catch(() => {})
        },
        onToken: (token) => {
          streamedText += token
          const snapshot = streamedText
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: snapshot } : m)),
          )
        },
        onDone: () => {
          setStreaming(false)
          refreshQuota()
        },
        onError: (err) => {
          throw err
        },
      })
    } catch (err) {
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        setStreaming(false)
        return
      }
      if (err?.status === 503) {
        setUnconfigured(true)
      } else if (err?.status === 429) {
        setChatError('Daily copilot limit reached. Your quota resets at midnight UTC.')
        refreshQuota()
      } else {
        setChatError(err.message || 'The copilot hit a snag. Please try again.')
      }
      // Remove the empty assistant bubble on failure.
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id))
      setStreaming(false)
    }
  }, [input, streaming, activeId, refreshQuota])

  const handleLeakReport = useCallback(async () => {
    setLeakLoading(true)
    setLeakError('')
    try {
      const report = await leakReport()
      setLeak(report)
      refreshQuota()
    } catch (err) {
      if (err?.response?.status === 503 || err?.status === 503) setUnconfigured(true)
      else setLeakError(apiErrorMessage(err))
    } finally {
      setLeakLoading(false)
    }
  }, [refreshQuota])

  const handlePreTrade = useCallback(async (e) => {
    e.preventDefault()
    setPtLoading(true)
    setPtError('')
    setPtResult(null)
    try {
      const payload = {
        symbol: ptForm.symbol.trim(),
        side: ptForm.side,
        entry: Number(ptForm.entry),
        stop: Number(ptForm.stop),
        target: Number(ptForm.target),
        quantity: Number(ptForm.quantity),
        accountSize: Number(ptForm.accountSize),
        maxRiskPct: Number(ptForm.maxRiskPct) || 1,
      }
      const result = await preTrade(payload)
      setPtResult(result)
      refreshQuota()
    } catch (err) {
      if (err?.response?.status === 503 || err?.status === 503) setUnconfigured(true)
      else setPtError(apiErrorMessage(err))
    } finally {
      setPtLoading(false)
    }
  }, [ptForm, refreshQuota])

  const leakHtml = useMemo(() => renderMarkdown(leak?.reportMarkdown), [leak])
  const commentaryHtml = useMemo(() => renderMarkdown(ptResult?.aiCommentary), [ptResult])

  if (unconfigured) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-10">
          <Bot className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Copilot not connected yet</h2>
          <p className="text-neutral-400 mb-2">
            The Tradexa-GPT AI engine needs an API key before it can think.
            Everything else — your journal, analytics, and edge validator — works fine.
          </p>
          <p className="text-sm text-neutral-500">The site owner is wiring this up. Check back soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" /> Tradexa-GPT Copilot
          </h1>
          <p className="text-neutral-400 mt-1">Your quant coach — risk math, journal leaks, pre-trade discipline.</p>
        </div>
        {quota && (
          <div className="text-xs font-medium px-4 py-2 rounded-full border border-white/10 bg-white/5 text-neutral-300">
            {quota.remaining} / {quota.limit} messages left today
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-4">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold transition-colors mb-4"
              >
                <Plus className="w-4 h-4" /> New chat
              </button>
              {loadingConvs ? (
                <p className="text-neutral-500 text-sm px-2">Loading…</p>
              ) : conversations.length === 0 ? (
                <p className="text-neutral-500 text-sm px-2">No conversations yet.</p>
              ) : (
                <ul className="space-y-1 max-h-[480px] overflow-y-auto">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <div
                        className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                          activeId === c.id ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => selectConversation(c.id)}
                      >
                        <span className="flex-1 truncate">{c.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl flex flex-col h-[560px]">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Bot className="w-14 h-14 text-indigo-400/60 mb-4" />
                    <p className="text-neutral-300 font-medium mb-1">Ask about risk, sizing, or your journal</p>
                    <p className="text-neutral-500 text-sm max-w-md">
                      e.g. "My win rate is 42% with avg win ₹800 and avg loss ₹500 — do I have an edge?"
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                        m.role === 'USER'
                          ? 'bg-indigo-500 text-white rounded-br-md'
                          : 'bg-white/5 text-neutral-200 border border-white/10 rounded-bl-md'
                      }`}
                    >
                      {m.role === 'USER' ? (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      ) : (
                        <div
                          className="copilot-markdown"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content || '…') }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {chatError && (
                <div className="mx-6 mb-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {chatError}
                </div>
              )}

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder={streaming ? 'Copilot is thinking…' : 'Ask about your edge, risk, or discipline…'}
                    disabled={streaming}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all disabled:opacity-60"
                  />
                  <button
                    onClick={handleSend}
                    disabled={streaming || !input.trim()}
                    className="px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-bold transition-colors"
                    title="Send"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-600 mt-2">
                  Educational risk analysis only — not financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'leaks' && (
        <div className="max-w-3xl">
          <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-400" /> Journal Leak Report
            </h2>
            <p className="text-neutral-400 text-sm mb-6">
              The copilot reads your journal aggregates and names the three biggest leaks draining your P&amp;L —
              each with the stat that proves it and one discipline rule to fix it.
            </p>
            <button
              onClick={handleLeakReport}
              disabled={leakLoading}
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              {leakLoading ? 'Analyzing your journal…' : leak ? 'Regenerate report' : 'Generate my leak report'}
            </button>
            {leakError && <p className="text-red-400 text-sm mt-4">{leakError}</p>}
            {leak && !leak.hasData && (
              <p className="text-neutral-400 text-sm mt-6">
                No trades in your journal yet. <Link to="/upload" className="text-indigo-400 hover:text-indigo-300">Upload your trades</Link> first, then come back.
              </p>
            )}
            {leak?.hasData && (
              <div className="mt-6">
                <div className="flex gap-6 text-sm mb-6">
                  <span className="text-neutral-400">Trades <b className="text-white">{leak.totalTrades}</b></span>
                  <span className="text-neutral-400">Win rate <b className="text-white">{Number(leak.winRate).toFixed(1)}%</b></span>
                  <span className="text-neutral-400">Expectancy <b className="text-white">₹{leak.expectancy}</b></span>
                </div>
                <div className="copilot-markdown text-neutral-200 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: leakHtml }} />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'pretrade' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Pre-Trade Discipline Check
            </h2>
            <form onSubmit={handlePreTrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Symbol</label>
                  <input required value={ptForm.symbol} onChange={(e) => setPtForm({ ...ptForm, symbol: e.target.value })}
                    placeholder="NIFTY" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Side</label>
                  <select value={ptForm.side} onChange={(e) => setPtForm({ ...ptForm, side: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none">
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>
              {[
                ['entry', 'Entry price'], ['stop', 'Stop-loss'], ['target', 'Target'],
                ['quantity', 'Quantity'], ['accountSize', 'Account size (₹)'], ['maxRiskPct', 'Max risk % of account'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">{label}</label>
                  <input required type="number" step="any" min="0" value={ptForm[key]}
                    onChange={(e) => setPtForm({ ...ptForm, [key]: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" />
                </div>
              ))}
              {ptError && <p className="text-red-400 text-sm">{ptError}</p>}
              <button type="submit" disabled={ptLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold transition-colors">
                {ptLoading ? 'Checking…' : 'Run discipline check'}
              </button>
            </form>
          </div>

          <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8">
            {!ptResult ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-neutral-500 text-sm">Fill the plan on the left — the math checks it before you risk a rupee.</p>
              </div>
            ) : (
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${
                  ptResult.verdict === 'PASS' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : ptResult.verdict === 'REVIEW' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  {ptResult.verdict === 'PASS' ? 'PASS — within your rules' : ptResult.verdict === 'REVIEW' ? 'REVIEW — think twice' : 'FLAG — do not take this trade'}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase mb-1">Risk</p>
                    <p className="text-xl font-bold text-red-400">₹{ptResult.riskAmount}</p>
                    <p className="text-xs text-neutral-500">{ptResult.riskPctOfAccount}% of account</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase mb-1">Reward</p>
                    <p className="text-xl font-bold text-emerald-400">₹{ptResult.rewardAmount}</p>
                    <p className="text-xs text-neutral-500">{ptResult.rMultiple}R</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {ptResult.checklist.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className={item.ok ? 'text-emerald-400' : 'text-red-400'}>{item.ok ? '✓' : '✗'}</span>
                      <span>
                        <b className="text-neutral-200">{item.label}</b>
                        <span className="text-neutral-500 block text-xs mt-0.5">{item.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {commentaryHtml && (
                  <div className="border-t border-white/10 pt-5">
                    <p className="text-xs font-semibold text-neutral-400 uppercase mb-3">Coach's take</p>
                    <div className="copilot-markdown text-neutral-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: commentaryHtml }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
