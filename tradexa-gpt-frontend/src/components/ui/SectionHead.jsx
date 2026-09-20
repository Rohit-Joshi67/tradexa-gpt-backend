import Reveal from './Reveal'

/** Section heading block: kicker + title + lede, centered or left. */
export default function SectionHead({ kicker, title, lede, align = 'center', className = '' }) {
  const alignCls = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start'
  return (
    <Reveal className={`flex flex-col gap-4 max-w-2xl mb-12 md:mb-16 ${alignCls} ${className}`}>
      {kicker && <span className={`kicker${kicker.gold ? ' gold' : ''}`}>{kicker.text || kicker}</span>}
      <h2 className="h-sec">{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </Reveal>
  )
}
