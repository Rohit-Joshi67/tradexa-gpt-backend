import Reveal from './Reveal'

/** Consistent inner-page hero: kicker + display title + lede. */
export default function PageHero({ kicker, title, lede, children, align = 'center' }) {
  const alignCls = align === 'center' ? 'text-center items-center' : 'text-left items-start'
  return (
    <section className="relative overflow-hidden">
      <div className="bg-glow w-[560px] h-[380px] bg-[rgba(14,203,129,.07)] -top-32 left-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_75%)]" />
      <div className="wrap relative pt-[calc(68px+clamp(3rem,7vw,5.5rem))] pb-12 md:pb-16 flex flex-col gap-5 max-w-3xl mx-auto">
        <Reveal className={`flex flex-col gap-5 ${alignCls}`}>
          {kicker && <span className="kicker">{kicker}</span>}
          <h1 className="display-2">{title}</h1>
          {lede && <p className={`lede ${align === 'center' ? 'mx-auto' : ''}`}>{lede}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  )
}
