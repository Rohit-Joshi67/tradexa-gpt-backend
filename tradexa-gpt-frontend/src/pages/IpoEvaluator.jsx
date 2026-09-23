import { useState } from 'react'
import { Building2, Search, AlertTriangle, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function IpoEvaluator() {
  const [ipoName, setIpoName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const handleAnalyze = async (e, forceRefresh = false) => {
    if (e) e.preventDefault()
    if (!ipoName.trim()) return

    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const response = await fetch(`/api/ipo/evaluate?name=${encodeURIComponent(ipoName)}${forceRefresh ? '&forceRefresh=true' : ''}`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to analyze IPO')
      }
      
      setReport(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderConfidence = (conf) => {
    const text = conf?.toUpperCase()
    if (text === 'HIGH') return <span className="text-emerald-500 font-semibold text-xs ml-2">High Confidence</span>
    if (text === 'MEDIUM') return <span className="text-yellow-500 font-semibold text-xs ml-2">Medium Confidence</span>
    if (text === 'LOW') return <span className="text-red-500 font-semibold text-xs ml-2">Low Confidence</span>
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">IPO Evaluator</h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Institutional-grade AI evaluation of upcoming Initial Public Offerings.
          Our model analyzes DRHPs, RHPs, and official SEBI filings.
        </p>
      </div>

      <div className="card max-w-xl mx-auto mb-10">
        <form onSubmit={handleAnalyze} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Enter IPO or Company Name (e.g. Tata Technologies)"
              value={ipoName}
              onChange={(e) => setIpoName(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !ipoName.trim()}>
            {loading ? 'Researching...' : 'Analyze IPO'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-neutral-400">Analyzing primary sources and compiling evaluation...</p>
          <p className="text-xs text-neutral-500 mt-2">This may take up to 30 seconds.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 flex gap-3 items-start max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{report.company?.name || report.company?.ipo_name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-neutral">{report.company?.exchange}</span>
                  <span className="badge badge-primary">{report.company?.industry}</span>
                  {report.company?.status && <span className="badge badge-neutral">{report.company?.status}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">{report.score?.total}<span className="text-lg text-neutral-500 font-normal">/100</span></div>
                <div className="text-sm text-neutral-400">Overall Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-neutral-500 mb-1">Price Band</div>
                <div className="font-semibold">{report.ipo_details?.price_band || 'N/A'}</div>
              </div>
              <div>
                <div className="text-neutral-500 mb-1">Issue Size</div>
                <div className="font-semibold">{report.ipo_details?.issue_size ? `${report.ipo_details.issue_size}` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-neutral-500 mb-1">Data As Of</div>
                <div className="font-semibold">{new Date(report.metadata?.analysis_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-neutral-500 mb-1">Report Source</div>
                <div className="font-semibold text-blue-400">Cached (Database)</div>
              </div>
            </div>
            
            {isAdmin && (
               <div className="mt-4 pt-4 border-t border-white/5 text-right">
                 <button onClick={(e) => handleAnalyze(e, true)} className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded transition-colors flex items-center gap-2 inline-flex">
                   <RefreshCw className="w-3 h-3" /> Force Refresh (Admin)
                 </button>
               </div>
            )}
          </div>

          {/* Critical Risk Flags */}
          {report.critical_risk_flags?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" /> CRITICAL RISK FLAGS
              </h3>
              <ul className="space-y-2">
                {report.critical_risk_flags.map((risk, i) => (
                  <li key={i} className="flex gap-3 text-red-200/90 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2"></span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Core Framework Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryCard title="Business & Moat" data={report.business_moat} max={20} />
            <CategoryCard title="Earnings Quality" data={report.earnings_quality} max={25} />
            <CategoryCard title="Valuation & Offer" data={report.valuation_offer} max={20} />
            <CategoryCard title="Corporate Governance" data={report.governance} max={20} />
            <CategoryCard title="Institutional Structure" data={report.institutional_structure} max={15} />
          </div>

          {/* GMP Rule */}
          {report.gmp?.value && (
            <div className="card bg-neutral-900/50 border-neutral-800">
              <div className="flex gap-4 items-center">
                <Info className="w-6 h-6 text-neutral-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">GREY MARKET PREMIUM (GMP)</h4>
                  <p className="text-sm text-neutral-400">
                    Currently tracking at {report.gmp.value} {report.gmp.currency}. 
                    <span className="text-neutral-500 ml-1">Not included in fundamental evaluation. Unregulated market information.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-emerald-500/5 border-emerald-500/10">
              <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" /> KEY STRENGTHS
              </h3>
              <ul className="space-y-3">
                {report.key_strengths?.map((str, i) => (
                  <li key={i} className="text-sm text-neutral-300">{str}</li>
                ))}
              </ul>
            </div>
            
            <div className="card bg-orange-500/5 border-orange-500/10">
              <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5" /> KEY RISKS
              </h3>
              <ul className="space-y-3">
                {report.key_risks?.map((risk, i) => (
                  <li key={i} className="text-sm text-neutral-300">{risk}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="text-center text-xs text-neutral-600 mt-10">
            <p>Data derived from AI analysis of available filings. Not financial advice.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryCard({ title, data, max }) {
  if (!data) return null;
  return (
    <div className="card flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="text-xl font-bold text-white bg-white/5 px-2 py-1 rounded">
          {data.score}<span className="text-xs text-neutral-500 font-normal">/{max}</span>
        </div>
      </div>
      <p className="text-sm text-neutral-400 mb-4 flex-grow">{data.summary}</p>
      
      {data.confidence && (
        <div className="mt-auto pt-4 border-t border-white/5">
          <span className="text-xs text-neutral-500">Data Confidence: </span>
          <span className={`text-xs font-semibold ${
            data.confidence.toUpperCase() === 'HIGH' ? 'text-emerald-500' : 
            data.confidence.toUpperCase() === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {data.confidence.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
