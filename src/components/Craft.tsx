import { lazy, Suspense, useEffect, useLayoutEffect, useRef, Component, type ReactNode } from 'react'
import gsap from 'gsap'
import { media } from '../lib/media'
import { craft } from '../lib/store'
import { canWebGL, isCoarse } from '../lib/env'

const RazorScene = lazy(() => import('../three/RazorScene'))

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

const SPECS = [
  ['Blade', 'Carbon steel, 6/8″, full hollow grind'],
  ['Scales', 'Hand-finished ebony'],
  ['Pins', 'Solid brass'],
  ['Edge', 'Stropped before every client'],
]

function Poster() {
  return <img src={media.razor.src} width={media.razor.w} height={media.razor.h} alt={media.razor.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-80" />
}

/**
 * «Инструмент»: секция закрепляется, скролл раскрывает опасную бритву (3D, GLB) и поворачивает её;
 * мышь добавляет мягкий наклон. Характеристики появляются по одной. Без WebGL — статичный кадр.
 */
export default function Craft() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=180%', pin: true, scrub: 0.7, anticipatePin: 1, onUpdate: (s) => { craft.progress = s.progress } },
      })
      tl.from('[data-c-line]', { yPercent: 110, duration: 0.3, stagger: 0.06, ease: 'power3.out' }, 0)
        .from('[data-c-spec]', { opacity: 0, x: -30, duration: 0.2, stagger: 0.1 }, 0.3)
        .fromTo('[data-c-glow]', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.1, duration: 0.8 }, 0)
        .to({}, { duration: 0.3 })
    })
    mm.add('(prefers-reduced-motion: reduce)', () => { craft.progress = 1 })
    return () => { mm.revert(); craft.progress = 0 }
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { craft.visible = e.isIntersecting })
    io.observe(stage.current!)
    const move = (e: PointerEvent) => { craft.mx = e.clientX / innerWidth - 0.5; craft.my = e.clientY / innerHeight - 0.5 }
    if (!isCoarse) addEventListener('pointermove', move, { passive: true })
    return () => { io.disconnect(); removeEventListener('pointermove', move); craft.visible = false }
  }, [])

  return (
    <section id="craft" ref={root} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-coal" aria-labelledby="c-h">
      <div data-c-glow aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full md:left-[62%]" style={{ background: 'radial-gradient(closest-side, rgba(184,160,122,.16), rgba(184,160,122,.04) 55%, transparent)' }} />
      <div ref={stage} className="absolute inset-x-0 top-[6svh] h-[58svh] md:inset-y-0 md:left-[30%] md:right-0 md:top-0 md:h-full">
        {canWebGL ? (
          <Boundary fallback={<Poster />}>
            <Suspense fallback={<div className="grid h-full place-items-center"><span className="meta animate-pulse">Loading the blade…</span></div>}><RazorScene /></Suspense>
          </Boundary>
        ) : <Poster />}
      </div>

      <div className="gutter pointer-events-none absolute inset-x-0 bottom-0 top-auto flex flex-col justify-end pb-[max(1.5rem,env(safe-area-inset-bottom))] md:inset-y-0 md:justify-center md:pb-0">
        <p className="meta mb-6">(03) — The tool</p>
        <h2 id="c-h" className="display m-0 text-[clamp(3.2rem,11vw,12rem)] text-milk">
          <span className="mask"><span data-c-line className="block">Forged</span></span>
          <span className="mask"><span data-c-line className="block text-brass">for</span></span>
          <span className="mask"><span data-c-line className="block">precision.</span></span>
        </h2>
        <dl className="m-0 mt-8 grid max-w-[26rem] gap-0 md:mt-12">
          {SPECS.map(([k, v]) => (
            <div key={k} data-c-spec className="grid grid-cols-[6rem_1fr] border-t border-milk/10 py-3 last:border-b [&:nth-child(n+3)]:[@media(max-height:720px)_and_(max-width:767px)]:hidden">
              <dt className="meta">{k}</dt><dd className="m-0 text-[0.92rem] text-milk/90">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p aria-hidden className="meta absolute right-[clamp(16px,4vw,72px)] top-[calc(env(safe-area-inset-top)+6rem)] hidden md:block">Scroll to open ↓</p>
    </section>
  )
}
