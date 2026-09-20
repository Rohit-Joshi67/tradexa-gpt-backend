/** Pure-SVG candlestick strip. Zero JS cost, crisp at any size. */
export default function Candles({ className = '', candles = 28, seed = 7, height = 120, positive = '#0ecb81', negative = '#f6465d' }) {
  const w = 560
  const cw = w / candles
  const bars = []
  let price = 0.5
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  for (let i = 0; i < candles; i++) {
    const drift = (rnd() - 0.42) * 0.16
    const open = price
    const close = Math.min(0.94, Math.max(0.06, price + drift))
    const high = Math.max(open, close) + rnd() * 0.07
    const low = Math.min(open, close) - rnd() * 0.07
    const up = close >= open
    const x = i * cw + cw * 0.28
    const bw = cw * 0.44
    const y = (v) => height - v * height
    bars.push(
      <g key={i}>
        <line x1={x + bw / 2} y1={y(high)} x2={x + bw / 2} y2={y(low)} stroke={up ? positive : negative} strokeWidth="1.4" opacity="0.75" />
        <rect x={x} y={y(Math.max(open, close))} width={bw} height={Math.max(2.5, Math.abs(y(open) - y(close)))} rx="1.4" fill={up ? positive : negative} opacity={up ? 0.92 : 0.85} />
      </g>,
    )
    price = close
  }
  // faint last-price line
  const lastY = height - price * height
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={height * f} x2={w} y2={height * f} stroke="rgba(148,163,184,.10)" strokeWidth="1" strokeDasharray="3 5" />
      ))}
      {bars}
      <line x1="0" y1={lastY} x2={w} y2={lastY} stroke={positive} strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
    </svg>
  )
}
