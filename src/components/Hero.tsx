import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { media } from '../lib/media'
import { isCoarse, reducedMotion } from '../lib/env'
import { openBooking } from '../lib/booking'
import Magnetic from './Magnetic'

/**
 * Первый экран: студийный кадр на всю ширину, огромный сверхузкий логотип внизу, слоган справа.
 * Вход: изображение «приезжает» из масштаба 1.3 (медленный zoom продолжается), строки выходят из масок, кнопка проявляется.
 * Мышь: декоративная «21», масть ♠ и прицельные линии двигаются с разной глубиной. Скролл: кадр уходит в глубину.
 */
export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.set('[data-h-line]', { yPercent: 110 })
      gsap.set('[data-h-fade]', { opacity: 0, y: 24 })
      gsap.set('[data-h-img]', { scale: 1.3 })
      gsap.set('[data-h-cta]', { opacity: 0, scale: 0.8 })
      gsap.set('[data-h-deco]', { opacity: 0 })
    }, root)
    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    if (!ready || reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.timeline()
        .to('[data-h-img]', { scale: 1.08, duration: 2.6, ease: 'expo.out' }, 0)
        .to('[data-h-line]', { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, 0.15)
        .to('[data-h-fade]', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08 }, 0.55)
        .to('[data-h-cta]', { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, 0.75)
        .to('[data-h-deco]', { opacity: 1, duration: 2, ease: 'power2.out' }, 0.6)
        // очень медленный «дыхательный» zoom после входа
        .to('[data-h-img]', { scale: 1.0, duration: 22, ease: 'none' }, 2.6)

      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
      gsap.to('[data-h-stage]', { yPercent: 18, scale: 0.94, ease: 'none', scrollTrigger: st })
      gsap.to('[data-h-dim]', { opacity: 0.85, ease: 'none', scrollTrigger: st })
      gsap.to('[data-h-title]', { yPercent: -18, ease: 'none', scrollTrigger: st })
    }, root)
    return () => ctx.revert()
  }, [ready])

  // параллакс от мыши: фон, «21», масть и линии живут на разной глубине
  useEffect(() => {
    if (reducedMotion || isCoarse) return
    const el = root.current!
    const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', el).map((n) => ({
      k: Number(n.dataset.depth), x: gsap.quickTo(n, 'x', { duration: 1.4, ease: 'power3' }), y: gsap.quickTo(n, 'y', { duration: 1.4, ease: 'power3' }),
    }))
    const move = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5
      layers.forEach((l) => { l.x(nx * l.k); l.y(ny * l.k) })
    }
    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [])

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink" aria-label="BLACK JACK BARBERS">
      <div data-h-stage className="absolute inset-0 origin-top will-change-transform">
        <div data-depth="-18" className="absolute inset-[-3%]">
          <picture>
            <source media="(max-aspect-ratio: 4/5)" srcSet={media.heroM.src} />
            <img data-h-img src={media.hero.src} width={media.hero.w} height={media.hero.h} alt={media.hero.alt} fetchPriority="high" decoding="async"
              className="h-full w-full object-cover will-change-transform" />
          </picture>
        </div>
        {/* тональные слои: низ и левый край уходят в чёрный, чтобы типографика читалась */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,.55)_0%,rgba(8,8,8,0)_28%,rgba(8,8,8,0)_52%,rgba(8,8,8,.92)_100%)]" />
        <div aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(8,8,8,.65)_0%,rgba(8,8,8,0)_45%)] md:block" />

        {/* декор: «21» и масть — отсылка к названию; прицельные линии */}
        <div aria-hidden data-h-deco className="pointer-events-none absolute inset-0">
          <span data-depth="34" className="display outline absolute right-[6vw] top-[14svh] text-[clamp(8rem,24vw,26rem)] leading-none opacity-[0.16]">21</span>
          <span data-depth="60" className="absolute right-[31vw] top-[22svh] hidden text-[2rem] text-brass md:block">♠</span>
          <span data-depth="12" className="absolute left-0 right-0 top-[38svh] h-px bg-milk/10" />
          <span data-depth="12" className="absolute bottom-0 top-0 left-[62vw] w-px bg-milk/10" />
          <span data-depth="12" className="absolute left-[62vw] top-[38svh] -translate-x-1/2 -translate-y-1/2 font-mono text-[0.6rem] tracking-[0.2em] text-milk/40">+</span>
        </div>
      </div>
      <div data-h-dim aria-hidden className="pointer-events-none absolute inset-0 bg-ink opacity-0" />

      {/* верхняя строка: слоган + гео */}
      <div className="gutter absolute inset-x-0 top-[calc(env(safe-area-inset-top)+6.5rem)] flex items-start justify-between gap-6 md:top-[20svh]">
        <p data-h-fade className="meta m-0 max-w-[22ch] leading-relaxed">Kyiv / Ukraine<br /><span className="text-milk/80">Premium men’s grooming</span></p>
        <p data-h-fade className="display-wide m-0 whitespace-nowrap text-right text-[clamp(1.1rem,2.2vw,2.2rem)] leading-[1.05] text-milk">Your style.<br /><span className="text-brass">Our craft.</span></p>
      </div>

      {/* логотип + CTA */}
      <div className="gutter absolute inset-x-0 bottom-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 data-h-title className="display m-0 text-[clamp(4.6rem,23vw,24rem)] text-milk md:text-[clamp(6rem,16.5vw,26rem)]">
            <span className="mask"><span data-h-line className="block">Black Jack</span></span>
            <span className="mask"><span data-h-line className="block pl-[0.04em] text-brass">Barbers</span></span>
          </h1>
          <div data-h-cta className="shrink-0 md:mb-[1.2vw]">
            <Magnetic strength={0.4}>
              <button onClick={() => openBooking()} data-cursor="arrow"
                className="group relative grid h-[8.5rem] w-[8.5rem] place-items-center overflow-hidden rounded-full border border-milk/40 text-milk md:h-[11rem] md:w-[11rem]">
                <span aria-hidden className="absolute inset-0 scale-0 rounded-full bg-milk transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-100 group-focus-visible:scale-100" />
                <span className="relative flex flex-col items-center gap-2 font-mono text-[0.72rem] uppercase leading-snug tracking-[0.16em] transition-colors duration-500 group-hover:text-ink group-focus-visible:text-ink">
                  <span>Book<br />appointment</span>
                  <span aria-hidden className="text-lg transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:-rotate-45">→</span>
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
