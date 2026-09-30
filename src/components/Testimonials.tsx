import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import gsap from 'gsap'
import { reviews } from '../lib/data'
import { reducedMotion } from '../lib/env'

const EASE = [0.16, 1, 0.3, 1] as const

/** Один большой отзыв по центру. Смена: слова уходят вверх из масок, новые выходят снизу; автопрокрутка, пауза при наведении. */
export default function Testimonials() {
  const root = useRef<HTMLElement>(null)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = reviews.length
  const r = reviews[i]

  useEffect(() => {
    if (paused || reducedMotion) return
    const t = setTimeout(() => setI((v) => (v + 1) % n), 7000)
    return () => clearTimeout(t)
  }, [i, paused, n])

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-t-fade]', { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
    })
    return () => mm.revert()
  }, [])

  const words = r.quote.toUpperCase().split(' ')
  return (
    <section ref={root} className="relative flex min-h-[90svh] flex-col justify-center bg-ink py-[16vh]" aria-roledescription="carousel" aria-label="Client reviews"
      onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="gutter text-center">
        <p data-t-fade className="meta mb-12">(07) — Word of mouth</p>
        <div aria-live="polite" className="relative mx-auto min-h-[3.4em] max-w-[16ch] text-[clamp(2.8rem,8.4vw,9.5rem)]">
          <AnimatePresence mode="wait">
            <motion.blockquote key={i} className="display m-0 text-milk" exit="out" initial="in" animate="on">
              <span className="text-brass">“</span>
              {words.map((w, k) => (
                <span key={k} className="inline-block overflow-hidden pb-[0.05em] pt-[0.1em] align-bottom">
                  <motion.span className="mr-[0.2em] inline-block"
                    variants={{ in: { y: '105%' }, on: { y: 0, transition: { duration: 0.9, delay: 0.04 * k, ease: EASE } }, out: { y: '-105%', transition: { duration: 0.5, delay: 0.02 * k, ease: [0.7, 0, 0.84, 0] } } }}>{w}</motion.span>
                </span>
              ))}
              <span className="text-brass">”</span>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={i} className="mt-10 font-mono text-sm uppercase tracking-[0.16em] text-milk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} exit={{ opacity: 0 }}>
            — {r.name} <span className="text-muted">/ {r.meta}</span>
          </motion.p>
        </AnimatePresence>
        <div data-t-fade className="mt-14 flex items-center justify-center gap-6">
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous review" className="grid h-12 w-12 place-items-center rounded-full border border-milk/20 text-milk transition-colors hover:border-brass hover:text-brass">←</button>
          <span className="w-24 font-mono text-sm tabular-nums text-milk">0{i + 1} <span className="text-muted">/ 0{n}</span></span>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next review" className="grid h-12 w-12 place-items-center rounded-full border border-milk/20 text-milk transition-colors hover:border-brass hover:text-brass">→</button>
        </div>
        <div className="mx-auto mt-8 flex max-w-[12rem] gap-2" aria-hidden>
          {reviews.map((_, k) => (
            <span key={k} className="relative h-px flex-1 overflow-hidden bg-milk/15">
              {k === i && <motion.span key={`${i}-${paused}`} className="absolute inset-0 origin-left bg-brass" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0.3 : 7, ease: 'linear' }} />}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
