import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Link } from 'react-router-dom'
import { Bot, Plus, Trash2, Send, AlertTriangle, ShieldCheck, FileSearch, Scale, MessageSquare, Square, Sparkles } from 'lucide-react'
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
      <div className="page">
        <div className="wrap max-w-2xl text-center pt-16">
          <div className="panel p-10 !border-[rgba(240,185,11,.35)] bg-[linear-gradient(180deg,rgba(240,185,11,.06),var(--color-panel))]">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[var(--color-gold-dim)] border border-[rgba(240,185,11,.4)] mx-auto mb-6">
              <Bot size={26} className="text-[var(--color-gold)]" />
            </span>
            <h2 className="font-display font-bold text-[24px] tracking-tight mb-3">Copilot not connected yet</h2>
            <p className="text-[var(--color-muted)] text-[14.5px] mb-2 leading-relaxed">
              The Tradexa-GPT AI engine needs an API key before it can think.
              Everything else — your journal, analytics, and edge validator — works fine.
            </p>
            <p className="text-[13px] text-[var(--color-faint)]">The site owner is wiring this up. Check back soon.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head !items-start">
        <div>
          <span className="kicker">Pro · AI coach</span>
          <h1 className="font-display font-bold tracking-tight text-[30px] md:text-[36px] mt-3 flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)]">
              <Sparkles size={21} className="text-[var(--color-profit)]" />
            </span>
            Tradexa-GPT Copilot
          </h1>
          <p className="text-[var(--color-muted)] text-[14.5px] mt-2">Your quant coach — risk math, journal leaks, pre-trade discipline.</p>
        </div>
        {quota && (
          <span className="badge badge-line tnum shrink-0 mt-2">
            {quota.remaining} / {quota.limit} left today
          </span>
        )}
      </div>

      <div className="wrap-wide">
        <div className="inline-flex gap-1.5 p-1.5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] mb-6" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all cursor-pointer ${
                tab === id
                  ? 'bg-[var(--color-profit)] text-[#04120c] shadow-[0_6px_18px_rgba(14,203,129,.3)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[rgba(255,255,255,.04)]'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'chat' && (
        <div className="wrap-wide grid lg:grid-cols-[280px_1fr] gap-5 items-start">
          <aside className="panel p-4 lg:sticky lg:top-[88px]">
            <button onClick={handleNewChat} className="btn btn-profit w-full mb-4">
              <Plus size={16} /> New chat
            </button>
            {loadingConvs ? (
              <p className="mut text-[13.5px] px-2 py-4">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="mut text-[13.5px] px-2 py-4 leading-relaxed">No conversations yet.<br />Ask your first question.</p>
            ) : (
              <ul className="space-y-1 max-h-[480px] overflow-y-auto chat-scroll pr-1">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <div
                      onClick={() => selectConversation(c.id)}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13.5px] cursor-pointer transition-colors ${
                        activeId === c.id
                          ? 'bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] text-[var(--color-ink)]'
                          : 'border border-transparent text-[var(--color-muted)] hover:bg-[rgba(255,255,255,.04)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      <MessageSquare size={14} className="shrink-0 opacity-60" />
                      <span className="flex-1 truncate">{c.title}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}
                        className="opacity-0 group-hover:opacity-100 text-[var(--color-faint)] hover:text-[var(--color-loss)] transition-all shrink-0"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <div className="panel overflow-hidden flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto chat-scroll p-5 md:p-6 space-y-5">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <span className="grid place-items-center w-16 h-16 rounded-3xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mb-5">
                    <Bot size={28} className="text-[var(--color-profit)]" />
                  </span>
                  <p className="font-display font-semibold text-[17px] mb-1.5">Ask about risk, sizing, or your journal</p>
                  <p className="mut text-[13.5px] max-w-md leading-relaxed">
                    e.g. "My win rate is 42% with avg win ₹800 and avg loss ₹500 — do I have an edge?"
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {['Am I overtrading?', 'Check my Friday leak', 'Size a 1% risk trade'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="badge badge-line !normal-case !tracking-normal !font-medium !text-[12.5px] hover:!border-[var(--color-line2)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] md:max-w-[82%] rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed ${
                      m.role === 'USER'
                        ? 'bg-[var(--color-profit)] text-[#04120c] font-medium rounded-br-md'
                        : 'bg-[var(--color-panel3)] text-[var(--color-ink)] border border-[var(--color-line)] rounded-bl-md'
                    }`}
                  >
                    {m.role === 'USER' ? (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    ) : m.content ? (
                      <div className="copilot-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                    ) : (
                      <span className="typing-dots" aria-label="Thinking"><span /><span /><span /></span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {chatError && (
              <div className="mx-5 md:mx-6 mb-3 alert alert-error flex items-center gap-2.5 !py-2.5">
                <AlertTriangle size={15} className="shrink-0" /> <span className="text-[13.5px]">{chatError}</span>
              </div>
            )}

            <div className="p-4 md:p-5 border-t border-[var(--color-line)] bg-[rgba(255,255,255,.012)]">
              <div className="flex gap-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={streaming ? 'Copilot is thinking…' : 'Ask about your edge, risk, or discipline…'}
                  disabled={streaming}
                  aria-label="Message the copilot"
                  className="field !rounded-xl flex-1"
                />
                {streaming ? (
                  <button
                    onClick={() => abortRef.current?.abort()}
                    className="btn btn-danger !px-4 shrink-0"
                    title="Stop"
                    aria-label="Stop generating"
                  >
                    <Square size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="btn btn-profit !px-5 shrink-0"
                    title="Send"
                    aria-label="Send message"
                  >
                    <Send size={17} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-faint)] mt-2.5">
                Educational risk analysis only — not financial advice.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'leaks' && (
        <div className="wrap-wide max-w-3xl !mx-0">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title flex items-center gap-2.5">
                <FileSearch size={16} className="text-[var(--color-profit)]" /> Journal Leak Report
              </span>
              <span className="badge badge-profit">AI</span>
            </div>
            <div className="panel-body">
              <p className="mut text-[14px] mb-6 leading-relaxed">
                The copilot reads your journal aggregates and names the three biggest leaks draining your P&amp;L —
                each with the stat that proves it and one discipline rule to fix it.
              </p>
              <button onClick={handleLeakReport} disabled={leakLoading} className="btn btn-profit">
                {leakLoading ? 'Analyzing your journal…' : leak ? 'Regenerate report' : 'Generate my leak report'}
              </button>
              {leakError && <div className="alert alert-error mt-4">{leakError}</div>}
              {leak && !leak.hasData && (
                <p className="mut text-[14px] mt-6">
                  No trades in your journal yet. <Link to="/upload" className="text-[var(--color-profit)] font-semibold hover:underline">Upload your trades</Link> first, then come back.
                </p>
              )}
              {leak?.hasData && (
                <div className="mt-7">
                  <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                      { l: 'Trades', v: leak.totalTrades },
                      { l: 'Win rate', v: `${Number(leak.winRate).toFixed(1)}%` },
                      { l: 'Expectancy', v: `₹${leak.expectancy}` },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-[var(--color-line)] bg-[rgba(255,255,255,.015)] px-4 py-3.5 text-center">
                        <p className="stat-num tnum text-[22px]">{s.v}</p>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-faint)] mt-1">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="copilot-markdown" dangerouslySetInnerHTML={{ __html: leakHtml }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'pretrade' && (
        <div className="wrap-wide grid lg:grid-cols-2 gap-5 items-start">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-[var(--color-profit)]" /> Pre-Trade Discipline Check
              </span>
            </div>
            <form onSubmit={handlePreTrade} className="panel-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="pt-symbol">Symbol</label>
                  <input id="pt-symbol" required value={ptForm.symbol} onChange={(e) => setPtForm({ ...ptForm, symbol: e.target.value })}
                    placeholder="NIFTY" className="field tnum uppercase" />
                </div>
                <div>
                  <label className="label" htmlFor="pt-side">Side</label>
                  <select id="pt-side" value={ptForm.side} onChange={(e) => setPtForm({ ...ptForm, side: e.target.value })} className="field">
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['entry', 'Entry price'], ['stop', 'Stop-loss'], ['target', 'Target'],
                  ['quantity', 'Quantity'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="label" htmlFor={`pt-${key}`}>{label}</label>
                    <input id={`pt-${key}`} required type="number" step="any" min="0" value={ptForm[key]}
                      onChange={(e) => setPtForm({ ...ptForm, [key]: e.target.value })}
                      className="field tnum" />
                  </div>
                ))}
                <div>
                  <label className="label" htmlFor="pt-account">Account size (₹)</label>
                  <input id="pt-account" required type="number" step="any" min="0" value={ptForm.accountSize}
                    onChange={(e) => setPtForm({ ...ptForm, accountSize: e.target.value })} className="field tnum" />
                </div>
                <div>
                  <label className="label" htmlFor="pt-risk">Max risk % of account</label>
                  <input id="pt-risk" required type="number" step="any" min="0" value={ptForm.maxRiskPct}
                    onChange={(e) => setPtForm({ ...ptForm, maxRiskPct: e.target.value })} className="field tnum" />
                </div>
              </div>
              {ptError && <div className="alert alert-error">{ptError}</div>}
              <button type="submit" disabled={ptLoading} className="btn btn-profit w-full btn-lg">
                {ptLoading ? 'Checking…' : 'Run discipline check'}
              </button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Verdict</span>
              {ptResult && (
                <span className={`badge ${ptResult.verdict === 'PASS' ? 'badge-profit' : ptResult.verdict === 'REVIEW' ? 'badge-gold' : 'badge-loss'}`}>
                  {ptResult.verdict}
                </span>
              )}
            </div>
            <div className="panel-body">
              {!ptResult ? (
                <div className="empty-wrap">
                  <ShieldCheck size={30} className="mx-auto text-[var(--color-faint)]" />
                  <h3>Nothing checked yet</h3>
                  <p className="text-[13.5px]">Fill the plan on the left — the math checks it before you risk a rupee.</p>
                </div>
              ) : (
                <div>
                  <p className={`text-[14.5px] font-semibold mb-6 ${ptResult.verdict === 'PASS' ? 'text-[var(--color-profit)]' : ptResult.verdict === 'REVIEW' ? 'text-[var(--color-gold)]' : 'text-[var(--color-loss)]'}`}>
                    {ptResult.verdict === 'PASS' ? 'Within your rules — size is sane, risk is capped.' : ptResult.verdict === 'REVIEW' ? 'Borderline — think twice before taking this trade.' : 'Breaks your rules — do not take this trade.'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl border border-[rgba(246,70,93,.3)] bg-[var(--color-loss-dim)] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-faint)]">Risk</p>
                      <p className="stat-num tnum text-[24px] text-[var(--color-loss)] mt-1">₹{ptResult.riskAmount}</p>
                      <p className="text-[12px] mut tnum">{ptResult.riskPctOfAccount}% of account</p>
                    </div>
                    <div className="rounded-xl border border-[rgba(14,203,129,.3)] bg-[var(--color-profit-dim)] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-faint)]">Reward</p>
                      <p className="stat-num tnum text-[24px] text-[var(--color-profit)] mt-1">₹{ptResult.rewardAmount}</p>
                      <p className="text-[12px] mut tnum">{ptResult.rMultiple}R</p>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {ptResult.checklist.map((item, i) => (
                      <li key={i} className="flex gap-3 text-[13.5px]">
                        <span className={`grid place-items-center w-6 h-6 rounded-full shrink-0 mt-0.5 ${item.ok ? 'bg-[var(--color-profit-dim)] text-[var(--color-profit)]' : 'bg-[var(--color-loss-dim)] text-[var(--color-loss)]'}`}>
                          {item.ok ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
                        </span>
                        <span>
                          <b className="text-[var(--color-ink)] font-semibold">{item.label}</b>
                          <span className="mut block text-[12.5px] mt-0.5">{item.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {commentaryHtml && (
                    <div className="border-t border-[var(--color-line)] pt-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-faint)] mb-3">Coach's take</p>
                      <div className="copilot-markdown" dangerouslySetInnerHTML={{ __html: commentaryHtml }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
