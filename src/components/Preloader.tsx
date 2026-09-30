import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/env'
import { lockScroll } from '../lib/motion'

/**
 * Загрузка ≈1,3 с: счётчик 0→100 и тонкая латунная линия; затем слова уходят вверх в маску,
 * а сам экран «раскрывается» clip-path снизу вверх — под ним уже стартует hero.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(reducedMotion)

  useLayoutEffect(() => {
    if (reducedMotion) { onDone(); return }
    lockScroll(true)
    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      gsap.set('[data-pl-word]', { yPercent: 110 })
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .to('[data-pl-word]', { yPercent: 0, duration: 0.8, stagger: 0.08 }, 0)
        .to(counter, { v: 100, duration: 1.05, ease: 'power2.inOut', onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0') } }, 0.05)
        .fromTo('[data-pl-bar]', { scaleX: 0 }, { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, 0.05)
        .to('[data-pl-word]', { yPercent: -110, duration: 0.55, ease: 'power3.in', stagger: 0.05 }, 1.12)
        .to('[data-pl-meta]', { opacity: 0, duration: 0.3 }, 1.12)
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'power4.inOut' }, 1.35)
        .add(() => { lockScroll(false); onDone() }, 1.45)
        .add(() => setGone(true), 2.25)
    }, root)
    return () => ctx.revert()
  }, [onDone])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[300] flex flex-col justify-between bg-ink" style={{ clipPath: 'inset(0% 0% 0% 0%)' }} role="status" aria-label="Loading BLACK JACK BARBERS">
      <div data-pl-meta className="gutter flex justify-between pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-8">
        <span className="meta">Est. Kyiv</span>
        <span className="meta">Premium men’s grooming</span>
      </div>
      <div className="gutter">
        <h2 className="display m-0 text-[clamp(4.5rem,21vw,22rem)] text-milk">
          <span className="mask"><span data-pl-word className="block">Black Jack</span></span>
          <span className="mask"><span data-pl-word className="block text-brass">Barbers</span></span>
        </h2>
      </div>
      <div data-pl-meta className="gutter pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-10">
        <div className="mb-4 flex items-end justify-between">
          <span className="meta">Loading the chair</span>
          <span ref={num} className="font-mono text-[clamp(1.4rem,3vw,2.4rem)] tabular-nums text-milk">000</span>
        </div>
        <div className="hairline relative overflow-hidden"><span data-pl-bar className="absolute inset-0 origin-left bg-brass" /></div>
      </div>
    </div>
  )
}
