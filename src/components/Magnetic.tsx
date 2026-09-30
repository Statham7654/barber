import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { isCoarse, reducedMotion } from '../lib/env'

/** Магнитная обёртка: элемент тянется к курсору внутри своей зоны и мягко возвращается. На touch выключена. */
export default function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || isCoarse || reducedMotion) return
    const inner = el.firstElementChild as HTMLElement | null
    const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' })
    const ix = inner ? gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'power3' }) : null
    const iy = inner ? gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'power3' }) : null
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2)
      x(dx * strength); y(dy * strength); ix?.(dx * strength * 0.35); iy?.(dy * strength * 0.35)
    }
    const leave = () => { x(0); y(0); ix?.(0); iy?.(0) }
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [strength])
  return <div ref={ref} className={`inline-block will-change-transform ${className}`}>{children}</div>
}
