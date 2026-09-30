import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { X, ArrowLeft, ArrowRight } from 'lucide-react'
import { work, barbers } from '../lib/data'
import { lockScroll } from '../lib/motion'
import { reducedMotion } from '../lib/env'
import { openBooking } from '../lib/booking'
import { useFocusTrap } from '../lib/useFocusTrap'

/** Переход «в проект»: полноэкранная страница вырастает clip-path’ом прямо из кадра, по которому кликнули. */
type S = { index: number | null; rect: DOMRect | null }
let s: S = { index: null, rect: null }
const subs = new Set<() => void>()
export const openProject = (index: number, rect: DOMRect) => { s = { index, rect }; subs.forEach((f) => f()) }
const close = () => { s = { ...s, index: null }; subs.forEach((f) => f()) }
const useProject = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => s, () => s)

const DETAILS = [
  'A low taper that disappears into the neckline, scissor-worked on top for natural movement. Finished with a matte clay.',
  'Beard shaped to the jaw, cheek line set with a straight razor, hot towel and oil to close.',
  'Skin fade from zero, blended to a textured top. Sharp at the temple, soft everywhere else.',
  'Point-cut crop with a heavy fringe — made to be styled with fingers, not a comb.',
  'Two hours: cut, beard, hot-towel shave, face care and a pour from the bar.',
]

export default function ProjectView() {
  const { index, rect } = useProject()
  const [shown, setShown] = useState<number | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(shown !== null, panel)

  useEffect(() => {
    if (index === null) return
    setShown(index)
  }, [index])

  // вход: из прямоугольника карточки → на весь экран
  useEffect(() => {
    if (shown === null || index === null) return
    lockScroll(true)
    const el = panel.current!
    const r = rect ?? new DOMRect(innerWidth / 2, innerHeight / 2, 0, 0)
    const from = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 4px)`
    if (reducedMotion) { gsap.set(el, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }); return }
    const ctx = gsap.context(() => {
      gsap.timeline()
        .fromTo(el, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1, ease: 'power4.inOut' })
        .fromTo('[data-p-img]', { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0)
        .from('[data-p-line]', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.55)
        .from('[data-p-fade]', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 0.75)
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  // выход: панель уходит вверх шторкой
  useEffect(() => {
    if (index !== null || shown === null) return
    const done = () => { setShown(null); lockScroll(false) }
    if (reducedMotion) return done()
    gsap.to(panel.current, { clipPath: 'inset(0px 0px 100% 0px round 0px)', duration: 0.8, ease: 'power4.inOut', onComplete: done })
  }, [index, shown])

  useEffect(() => {
    if (shown === null) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [shown])

  if (shown === null) return null
  const w = work[shown], b = barbers[shown % barbers.length]
  const go = (d: number) => { const n = (shown + d + work.length) % work.length; s = { index: n, rect: null }; setShown(n); subs.forEach((f) => f()) }

  return (
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="p-h" data-lenis-prevent className="fixed inset-0 z-[200] overflow-y-auto overscroll-contain bg-coal">
      <div key={shown} className="grid min-h-full md:grid-cols-2">
        <div className="relative h-[55svh] overflow-hidden md:sticky md:top-0 md:h-[100svh]">
          <img data-p-img src={w.img.src} width={w.img.w} height={w.img.h} alt={w.img.alt} className="h-full w-full object-cover" />
        </div>
        <div className="gutter flex flex-col justify-between gap-12 py-10 md:py-12">
          <div className="flex items-center justify-between">
            <span data-p-fade className="meta">Project 0{shown + 1} / 0{work.length}</span>
            <button onClick={close} aria-label="Close project" className="grid h-12 w-12 place-items-center rounded-full border border-milk/25 text-milk transition-colors hover:border-brass hover:text-brass"><X size={18} /></button>
          </div>
          <div>
            <p data-p-fade className="meta mb-5 text-brass">{w.tag}</p>
            <h2 id="p-h" className="display m-0 text-[clamp(3.4rem,9vw,10rem)] text-milk">
              {w.title.split(' ').map((t, i) => <span key={i} className="mask"><span data-p-line className="block">{t}</span></span>)}
            </h2>
            <p data-p-fade className="mt-8 max-w-[44ch] text-[1.02rem] leading-relaxed text-muted">{DETAILS[shown]}</p>
            <dl data-p-fade className="m-0 mt-10 grid max-w-md grid-cols-2 gap-y-4 border-t border-milk/10 pt-6">
              <dt className="meta">Barber</dt><dd className="m-0 text-milk">{b.name}</dd>
              <dt className="meta">Service</dt><dd className="m-0 text-milk">{w.tag}</dd>
              <dt className="meta">Season</dt><dd className="m-0 text-milk">AW 2026</dd>
            </dl>
          </div>
          <div data-p-fade className="flex flex-wrap items-center justify-between gap-4">
            <button onClick={() => { close(); setTimeout(() => openBooking(), 850) }} className="flex h-14 items-center gap-3 rounded-full bg-milk px-7 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-brass">Book this look <span aria-hidden>→</span></button>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous project" className="grid h-12 w-12 place-items-center rounded-full border border-milk/25 text-milk hover:border-brass hover:text-brass"><ArrowLeft size={18} /></button>
              <button onClick={() => go(1)} aria-label="Next project" className="grid h-12 w-12 place-items-center rounded-full border border-milk/25 text-milk hover:border-brass hover:text-brass"><ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
