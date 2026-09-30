import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { HOURS, ADDRESS } from '../lib/data'
import { openBooking } from '../lib/booking'
import Magnetic from './Magnetic'

/** Большой CTA: две строки выходят из масок, кнопка при наведении «заливается» латунью от точки входа курсора. */
export default function Booking() {
  const root = useRef<HTMLElement>(null)
  const fill = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-bk-line]', { yPercent: 110, duration: 1.5, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: root.current, start: 'top 65%' } })
      gsap.from('[data-bk-fade]', { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 55%' } })
      gsap.fromTo('[data-bk-bg]', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    return () => mm.revert()
  }, [])

  // заливка из точки, где курсор вошёл в кнопку
  const enter = (e: React.PointerEvent<HTMLButtonElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    gsap.set(fill.current, { left: e.clientX - b.left, top: e.clientY - b.top })
  }

  return (
    <section id="book" ref={root} className="relative overflow-hidden bg-coal py-[18vh] md:py-[24vh]" aria-labelledby="bk-h">
      <div data-bk-bg aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 55% at 50% 60%, rgba(184,160,122,.12), transparent 70%)' }} />
      <div className="gutter relative">
        <p data-bk-fade className="meta mb-10 text-center">(06) — Booking</p>
        <h2 id="bk-h" className="display m-0 text-center text-[clamp(4rem,16.5vw,21rem)] text-milk">
          <span className="mask"><span data-bk-line className="block">Ready for a</span></span>
          <span className="mask"><span data-bk-line className="block text-brass">new look?</span></span>
        </h2>
        <div data-bk-fade className="mt-14 flex justify-center md:mt-20">
          <Magnetic strength={0.3}>
            <button onPointerEnter={enter} onClick={() => openBooking()} data-cursor="arrow"
              className="group relative flex h-20 items-center gap-6 overflow-hidden rounded-full border border-milk/40 px-10 font-mono text-sm uppercase tracking-[0.18em] text-milk md:h-28 md:px-16 md:text-base">
              <span ref={fill} aria-hidden className="absolute left-1/2 top-1/2 h-[260%] w-[140%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-brass transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-100 group-focus-visible:scale-100" style={{ aspectRatio: '1' }} />
              <span className="relative transition-colors duration-500 group-hover:text-ink group-focus-visible:text-ink">Book your chair</span>
              <span aria-hidden className="relative text-xl transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-ink">→</span>
            </button>
          </Magnetic>
        </div>
        <div data-bk-fade className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-milk/10 pt-8 md:mt-24 md:grid-cols-3">
          <div><p className="meta m-0 mb-2">Open</p><p className="m-0 text-milk">{HOURS.days}</p></div>
          <div><p className="meta m-0 mb-2">Hours</p><p className="m-0 font-mono text-milk">{HOURS.time}</p></div>
          <div className="col-span-2 md:col-span-1"><p className="meta m-0 mb-2">Address</p><p className="m-0 uppercase text-milk">{ADDRESS}</p></div>
        </div>
      </div>
    </section>
  )
}
