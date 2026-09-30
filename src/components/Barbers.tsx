import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { barbers } from '../lib/data'

/**
 * Команда: на широких экранах секция закрепляется и лента карточек едет горизонтально от скролла;
 * на телефоне — нативная горизонтальная прокрутка со snap. Наведение: ч/б → цвет, лёгкий zoom, выезжает подробность.
 */
export default function Barbers() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const t = track.current!
      const dist = () => t.scrollWidth - innerWidth
      gsap.to(t, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (s) => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})` },
        },
      })
      gsap.utils.toArray<HTMLElement>('[data-b-img]').forEach((img) => gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => '+=' + dist(), scrub: true } }))
    })
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-b-line]', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.from('[data-b-card]', { opacity: 0, y: 60, duration: 1.2, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 60%' } })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="team" ref={root} className="relative overflow-hidden bg-ink py-[14vh] md:flex md:h-[100svh] md:items-center md:py-0" aria-labelledby="b-h">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-[clamp(16px,4vw,72px)] md:w-max md:snap-none md:gap-[3vw] md:overflow-visible md:pr-[8vw]">
        <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-end pb-2 md:w-[34vw] md:self-center">
          <p className="meta mb-6">(04) — Team</p>
          <h2 id="b-h" className="display m-0 text-[clamp(3.6rem,15vw,7rem)] text-milk md:text-[clamp(4rem,8vw,11rem)]">
            <span className="mask"><span data-b-line className="block">Meet the</span></span>
            <span className="mask"><span data-b-line className="block text-brass">craftsmen</span></span>
          </h2>
          <p className="mt-6 max-w-[34ch] text-[0.95rem] leading-relaxed text-muted">Four barbers, one standard. Pick yours — or let us match you on the first visit.</p>
          <p className="meta mt-8 hidden items-center gap-3 md:flex"><span className="block h-px w-10 bg-milk/40" />Scroll</p>
        </div>

        {barbers.map((b, i) => (
          <article key={b.name} data-b-card className="group relative w-[74vw] shrink-0 snap-start md:w-[24vw] md:min-w-[300px]" style={{ marginBottom: i % 2 ? '0' : 'clamp(0px, 6vh, 80px)' }}>
            <div data-cursor="view" className="relative aspect-[4/5] overflow-hidden rounded-sm bg-coal">
              <div data-b-img className="absolute inset-[-8%] will-change-transform">
                <img src={b.img.src} width={b.img.w} height={b.img.h} alt={`${b.name} — ${b.img.alt}`} loading="lazy" decoding="async"
                  className="h-full w-full object-cover grayscale transition-[filter,transform] duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06] group-hover:grayscale-0 max-md:grayscale-0" />
              </div>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
              <span className="absolute left-4 top-4 font-mono text-xs text-milk/70">0{i + 1}</span>
              <span className="absolute right-4 top-4 font-mono text-xs text-brass">{b.years} yrs</span>
              <div className="absolute inset-x-4 bottom-4">
                <h3 className="display m-0 text-[clamp(2.2rem,9vw,3.4rem)] text-milk transition-transform duration-700 ease-[var(--ease-out-expo)] md:translate-y-6 md:text-[clamp(2rem,3vw,3.4rem)] md:opacity-0 md:transition-[opacity,transform] md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">{b.name}</h3>
                <div className="grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-out-expo)] md:grid-rows-[0fr] md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 md:group-focus-within:grid-rows-[1fr] md:group-focus-within:opacity-100">
                  <div className="overflow-hidden">
                    <p className="m-0 mt-2 text-[0.85rem] text-milk/70">{b.note}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[1rem] font-semibold uppercase tracking-[0.02em] text-milk">{b.name}</p>
                <p className="meta m-0 mt-1">{b.role} · {b.years} yrs</p>
              </div>
              <a href={`https://instagram.com/${b.handle}`} target="_blank" rel="noopener noreferrer" aria-label={`${b.name} on Instagram`}
                className="group/ig flex min-h-11 shrink-0 items-center gap-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-milk/80 hover:text-brass">
                Instagram <ArrowUpRight size={14} aria-hidden className="transition-transform duration-500 group-hover/ig:-translate-y-0.5 group-hover/ig:translate-x-0.5" />
              </a>
            </div>
          </article>
        ))}
        <div className="w-px shrink-0 md:w-[2vw]" />
      </div>
      <div aria-hidden className="gutter absolute inset-x-0 bottom-8 hidden md:block"><div className="hairline relative"><span ref={bar} className="absolute inset-0 origin-left bg-brass" style={{ transform: 'scaleX(0)' }} /></div></div>
    </section>
  )
}
