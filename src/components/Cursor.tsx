import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { isCoarse } from '../lib/env'

type Mode = 'default' | 'link' | 'view' | 'arrow' | 'drag'
const MODES: Record<Mode, { size: number; label: string }> = {
  default: { size: 10, label: '' },
  link: { size: 44, label: '' },
  view: { size: 96, label: 'View' },
  arrow: { size: 72, label: '→' },
  drag: { size: 96, label: 'Drag' },
}

/**
 * Курсор: маленькая молочная точка (mix-blend: difference — видна на любом фоне).
 * Над интерактивными элементами раскрывается в круг с подписью: data-cursor="view" | "arrow" | "drag"; ссылки и кнопки — кольцо.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (isCoarse) return
    const d = dot.current!, l = label.current!
    document.documentElement.classList.add('has-cursor')
    gsap.set(d, { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 })
    const x = gsap.quickTo(d, 'x', { duration: 0.35, ease: 'power3' }), y = gsap.quickTo(d, 'y', { duration: 0.35, ease: 'power3' })
    let mode: Mode = 'default', shown = false
    const set = (m: Mode) => {
      if (m === mode) return
      mode = m
      const c = MODES[m]
      const filled = m === 'view' || m === 'arrow' || m === 'drag'
      gsap.to(d, { width: c.size, height: c.size, backgroundColor: filled ? '#f2f0ea' : m === 'link' ? 'rgba(242,240,234,0)' : '#f2f0ea', borderColor: m === 'link' ? 'rgba(242,240,234,.9)' : 'rgba(242,240,234,0)', mixBlendMode: filled ? 'normal' : 'difference', duration: 0.5, ease: 'expo.out' } as gsap.TweenVars)
      l.textContent = c.label
      gsap.to(l, { opacity: c.label ? 1 : 0, scale: c.label ? 1 : 0.6, duration: 0.35, ease: 'power3.out' })
    }
    const move = (e: PointerEvent) => {
      if (!shown) { shown = true; gsap.to(d, { opacity: 1, duration: 0.3 }) }
      x(e.clientX); y(e.clientY)
      const t = (e.target as HTMLElement).closest?.('[data-cursor],a,button,[role=button],input,select,textarea,label') as HTMLElement | null
      if (!t) return set('default')
      const m = t.dataset.cursor as Mode | undefined
      set(m && m in MODES ? m : 'link')
    }
    const leave = () => { shown = false; gsap.to(d, { opacity: 0, duration: 0.3 }) }
    const down = () => gsap.to(d, { scale: 0.82, duration: 0.2 }), up = () => gsap.to(d, { scale: 1, duration: 0.4, ease: 'expo.out' })
    addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerleave', leave)
    addEventListener('pointerdown', down); addEventListener('pointerup', up)
    return () => {
      removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave)
      removeEventListener('pointerdown', down); removeEventListener('pointerup', up)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])
  if (isCoarse) return null
  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[400] hidden md:block">
      <div ref={dot} className="grid h-[10px] w-[10px] place-items-center rounded-full border border-transparent bg-milk opacity-0 mix-blend-difference will-change-transform">
        <span ref={label} className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink opacity-0" />
      </div>
    </div>
  )
}
