import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'motion/react'
import { services, uah } from '../lib/data'
import { isCoarse, reducedMotion } from '../lib/env'
import { openBooking } from '../lib/booking'

/**
 * Услуги — не карточки, а редакционный список. Desktop: наведение увеличивает строку, остальные гаснут,
 * номер загорается латунью, появляется стрелка, а кадр услуги плывёт за курсором (с инерцией и наклоном по скорости).
 * Touch: строка раскрывается — описание, кадр и кнопка записи.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(0)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-s-line]', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.from('[data-s-row]', { opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '[data-s-list]', start: 'top 82%' } })
      gsap.from('[data-s-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut', stagger: 0.08, scrollTrigger: { trigger: '[data-s-list]', start: 'top 82%' } })
    })
    return () => mm.revert()
  }, [])

  // превью следует за курсором: координаты сглажены, наклон зависит от скорости по X
  useEffect(() => {
    if (isCoarse || reducedMotion) return
    const el = preview.current!
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' }), y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
    const r = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3' })
    let lx = 0
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY); r(gsap.utils.clamp(-10, 10, (e.clientX - lx) * 0.4)); lx = e.clientX }
    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    if (isCoarse || reducedMotion) return
    gsap.to(preview.current, { opacity: hover === null ? 0 : 1, scale: hover === null ? 0.7 : 1, duration: 0.6, ease: 'expo.out' })
  }, [hover])

  return (
    <section id="services" ref={root} className="relative bg-ink pb-[14vh] pt-[16vh] md:pb-[20vh] md:pt-[22vh]" aria-labelledby="s-h">
      <div className="gutter">
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <h2 id="s-h" className="display m-0 text-[clamp(4rem,15vw,19rem)] text-milk">
            <span className="mask"><span data-s-line className="block">Our</span></span>
            <span className="mask"><span data-s-line className="block md:pl-[8vw]">Services</span></span>
          </h2>
          <p className="meta m-0 max-w-[32ch] md:mb-4 md:text-right">(02) — Five rituals, one standard.<br />Prices in UAH.</p>
        </div>

        <ul data-s-list className="m-0 list-none p-0" onPointerLeave={() => setHover(null)}>
          {services.map((s, i) => {
            const on = hover === i, dim = hover !== null && !on, expanded = isCoarse && open === i
            return (
              <li key={s.name} data-s-row className="relative">
                <span data-s-rule aria-hidden className="hairline block" />
                <button type="button" data-cursor="view"
                  onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(i) }}
                  onFocus={() => !isCoarse && setHover(i)} onBlur={() => setHover(null)}
                  onClick={() => (isCoarse ? setOpen(open === i ? null : i) : openBooking(s.name))}
                  aria-expanded={isCoarse ? expanded : undefined}
                  aria-label={isCoarse ? `${s.name}, ${s.time}, ${uah(s.price)}` : `Book ${s.name}, ${s.time}, ${uah(s.price)}`}
                  className={`group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline md:items-center gap-x-4 py-6 text-left transition-[opacity,padding] duration-700 ease-[var(--ease-out-expo)] md:grid-cols-[4rem_minmax(0,1fr)_15rem_7rem_2.5rem] md:gap-x-8 md:py-9 ${dim ? 'opacity-25' : 'opacity-100'} ${on ? 'md:py-12' : ''}`}>
                  <span className={`font-mono text-sm transition-colors duration-500 ${on || expanded ? 'text-brass' : 'text-muted'}`}>0{i + 1}</span>
                  <span className={`display block origin-left text-[clamp(2.2rem,5.6vw,6.4rem)] md:whitespace-nowrap text-milk transition-transform duration-700 ease-[var(--ease-out-expo)] ${on ? 'md:translate-x-4 md:scale-[1.06]' : ''}`}>{s.name}</span>
                  <span className="whitespace-nowrap text-right font-mono text-sm text-milk md:hidden">{uah(s.price)}</span>
                  <span className="hidden max-w-[30ch] self-center text-[0.9rem] leading-snug text-muted md:block">{s.desc}</span>
                  <span className="hidden self-center text-right font-mono text-[0.8rem] uppercase tracking-[0.1em] text-muted md:block">{s.time}<br /><span className="text-[1rem] text-milk">{uah(s.price)}</span></span>
                  <span aria-hidden className={`hidden self-center justify-self-end text-3xl text-brass transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] md:block ${on ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>→</span>
                </button>
                {/* touch: раскрытие */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden md:hidden">
                      <div className="grid gap-5 pb-8 pl-[3.5rem]">
                        <p className="m-0 text-[0.95rem] leading-relaxed text-muted">{s.desc}</p>
                        <div className="aspect-[4/3] overflow-hidden rounded-sm bg-coal">
                          <img src={s.img.src} width={s.img.w} height={s.img.h} alt={s.img.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="meta">{s.time}</span>
                          <button onClick={() => openBooking(s.name)} className="flex h-12 items-center gap-2 rounded-full bg-milk px-5 font-mono text-xs uppercase tracking-[0.16em] text-ink">Book this <span aria-hidden>→</span></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
          <li aria-hidden><span data-s-rule className="hairline block" /></li>
        </ul>
      </div>

      {/* плавающее превью (desktop) */}
      {!isCoarse && (
        <div ref={preview} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] hidden aspect-[4/5] w-[clamp(220px,19vw,340px)] overflow-hidden rounded-sm opacity-0 md:block">
          {services.map((s, i) => (
            <img key={s.name} src={s.img.src} width={s.img.w} height={s.img.h} alt="" loading="lazy" decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]"
              style={{ opacity: hover === i ? 1 : 0, transform: hover === i ? 'scale(1)' : 'scale(1.15)' }} />
          ))}
        </div>
      )}
    </section>
  )
}
