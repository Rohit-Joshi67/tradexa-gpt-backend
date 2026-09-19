import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, Calculator, TrendingUp, AlertTriangle, Activity, ArrowLeft } from 'lucide-react';
import { edgeValidate } from '../api/copilot';
import { apiErrorMessage } from '../api/client';

const PATH_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function TradingEdgeValidator() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { plan } = usePlan();
  const isPro = plan === 'PRO';

  const [inputs, setInputs] = useState({
    winRate: 45,
    avgWin: 500,
    avgLoss: 250,
    trades: 100,
    fees: 2,
    riskPerTrade: 1,
    capital: 10000,
  });
  const [seed, setSeed] = useState(42);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evError, setEvError] = useState('');
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: Number(e.target.value) });
  };

  // Monte Carlo + edge math now runs on the backend (Pro-only). Debounced.
  useEffect(() => {
    if (!isPro) return;
    setLoading(true);
    setEvError('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      edgeValidate({
        winRate: inputs.winRate,
        avgWin: inputs.avgWin,
        avgLoss: inputs.avgLoss,
        fees: inputs.fees,
        trades: inputs.trades,
        paths: 5,
        capital: inputs.capital,
        seed,
      })
        .then(setResult)
        .catch((err) => {
          if (err?.response?.status !== 402) setEvError(apiErrorMessage(err));
          setResult(null);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [inputs, seed, isPro]);

  const stats = result?.stats || {};
  const mcStats = result?.mcStats || {};

  const chartData = useMemo(() => {
    if (!result?.paths?.length) return [];
    const n = result.paths[0].length;
    return Array.from({ length: n }, (_, i) => {
      const row = { trade: i };
      result.paths.forEach((p, pi) => { row[`p${pi + 1}`] = p[i]; });
      return row;
    });
  }, [result]);

  const netExpectancy = stats.netExpectancy ?? 0;
  const profitFactor = stats.profitFactor ?? 0;
  const breakEvenPct = stats.breakEvenWinRatePct ?? 0;
  const edge = stats.edgePct ?? 0;
  const expectedReturn = netExpectancy * inputs.trades;
  const expectedR = stats.expectedRPer100 ?? 0;
  const payoffRatio = stats.payoffRatio ?? 0;
  const halfKelly = stats.halfKellyPct ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50 pointer-events-none"></div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
            {!isPro && (
              <Link to="/login" className="text-sm font-medium bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-600 transition-colors">
                Log In for Pro Features
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard" className="text-sm font-medium bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Trading Edge <span className="text-emerald-400">Validator</span></h1>
          <p className="text-neutral-400 text-lg">You have a strategy, but do you actually have an edge? Let the math decide.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-400"/> Strategy Inputs</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Win Rate (%)</label>
                  <input type="number" name="winRate" value={inputs.winRate} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Avg Winner (₹)</label>
                    <input type="number" name="avgWin" value={inputs.avgWin} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Avg Loser (₹)</label>
                    <input type="number" name="avgLoss" value={inputs.avgLoss} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Fees/Slippage (₹)</label>
                    <input type="number" name="fees" value={inputs.fees} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Capital (₹)</label>
                    <input type="number" name="capital" value={inputs.capital} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">Trades to simulate</label>
                  <input type="number" name="trades" value={inputs.trades} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px]"></div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Net Expectancy</span>
                <span className={"text-4xl font-bold " + (netExpectancy > 0 ? "text-emerald-400" : "text-red-400")}>
                  {netExpectancy > 0 ? '+' : ''}{Number(netExpectancy).toFixed(2)}
                </span>
                <span className="text-sm text-neutral-500 block mt-2">Per trade average (₹)</span>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Profit Factor</span>
                <span className={"text-4xl font-bold " + (profitFactor > 1.2 ? "text-emerald-400" : "text-amber-400")}>
                  {Number(profitFactor).toFixed(2)}
                </span>
                <span className="text-sm text-neutral-500 block mt-2">Gross win / Gross loss</span>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Breakeven Win %</span>
                <span className="text-4xl font-bold text-white">
                  {Number(breakEvenPct).toFixed(1)}%
                </span>
                <span className="text-sm text-neutral-500 block mt-2">To stay profitable</span>
              </div>
            </div>

            <div className="relative">
              {!isPro && (
                <div className="absolute inset-0 z-20 backdrop-blur-xl bg-[#0a0a0a]/60 rounded-3xl flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl text-center max-w-md shadow-2xl">
                    <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Unlock Deep Analytics</h3>
                    <p className="text-neutral-400 mb-8">A Tradexa Pro subscription is required to run Monte Carlo simulations, view risk of ruin, survival probabilities, and advanced distribution metrics.</p>
                    {isAuthenticated ? (
                      <Link to="/pricing" className="block w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors">Upgrade to Pro</Link>
                    ) : (
                      <Link to="/login" className="block w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors">Log In / Register</Link>
                    )}
                  </div>
                </div>
              )}

              <div className={"space-y-8 " + (!isPro ? "opacity-30 pointer-events-none select-none blur-sm" : "")}>
                {evError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                    {evError}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-neutral-400 uppercase mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/> Drawdown & Survival</h4>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Expected Losing Streak ({inputs.trades} trades)</span>
                        <span className="font-bold text-white">{Number(stats.expectedLosingStreak ?? 0).toFixed(1)} trades</span>
                      </li>
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Prob of 5 Consecutive Losses</span>
                        <span className="font-bold text-amber-400">{Number(stats.prob5LossesPct ?? 0).toFixed(2)}%</span>
                      </li>
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Prob of 10 Consecutive Losses</span>
                        <span className="font-bold text-red-400">{Number(stats.prob10LossesPct ?? 0).toFixed(2)}%</span>
                      </li>
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Prob of Ruin (&lt;20% capital)</span>
                        <span className="font-bold text-red-400">{Number(mcStats.probRuinPct ?? 0).toFixed(1)}%</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="text-neutral-300">Max Suggested Risk (Half-Kelly)</span>
                        <span className="font-bold text-indigo-400">{halfKelly > 0 ? Number(halfKelly).toFixed(2) + '%' : 'N/A'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-neutral-400 uppercase mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400"/> Strategy Performance</h4>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Expected Return ({inputs.trades} trades)</span>
                        <span className={"font-bold " + (expectedReturn > 0 ? "text-emerald-400" : "text-red-400")}>
                          ₹{Number(expectedReturn).toFixed(2)}
                        </span>
                      </li>
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Expected R per 100 trades</span>
                        <span className="font-bold text-white">+{Number(expectedR).toFixed(2)} R</span>
                      </li>
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Payoff Ratio (Reward/Risk)</span>
                        <span className="font-bold text-white">{Number(payoffRatio).toFixed(2)} : 1</span>
                      </li>
                      <li className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-neutral-300">Median Outcome ({inputs.trades} trades)</span>
                        <span className="font-bold text-white">₹{Number(mcStats.medianFinal ?? 0).toFixed(2)}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="text-neutral-300">Mathematical Edge</span>
                        <span className={"font-bold " + (edge > 0 ? "text-emerald-400" : "text-red-400")}>{Number(edge).toFixed(2)}%</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-bold text-neutral-400 uppercase flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400"/> Monte Carlo Simulation ({inputs.trades} Trades)</h4>
                    <button onClick={() => setSeed(Date.now() % 100000)} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">Run Again</button>
                  </div>
                  {loading && chartData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">Running simulation…</div>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="trade" stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} />
                      <YAxis stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      {result?.paths?.map((_, pi) => (
                        <Line key={pi} type="monotone" dataKey={`p${pi + 1}`}
                          stroke={PATH_COLORS[pi % PATH_COLORS.length]}
                          strokeWidth={2} dot={false} opacity={0.6} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
