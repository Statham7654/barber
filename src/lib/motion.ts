import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { reducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true })

let lenis: Lenis | null = null
export const getLenis = () => lenis

export function initSmoothScroll() {
  if (reducedMotion || lenis) return lenis
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function lockScroll(lock: boolean) {
  if (lenis) lock ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

/** Переход к секции: графитовая шторка с монограммой закрывает экран, скролл прыгает, шторка уходит вверх. */
export function goTo(target: string) {
  const veil = document.getElementById('veil')
  const el = document.querySelector(target) as HTMLElement | null
  if (!el) return
  const jump = () => (lenis ? lenis.scrollTo(el, { immediate: true, force: true }) : el.scrollIntoView())
  if (!veil || reducedMotion) return jump()
  const mark = veil.querySelector('[data-veil-mark]')
  gsap.timeline({ defaults: { ease: 'power3.inOut' } })
    .set(veil, { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' })
    .set(mark, { autoAlpha: 0, yPercent: 40 })
    .to(veil, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 })
    .to(mark, { autoAlpha: 1, yPercent: 0, duration: 0.35, ease: 'power3.out' }, '-=0.18')
    .add(() => { jump(); ScrollTrigger.refresh() })
    .to(mark, { autoAlpha: 0, yPercent: -40, duration: 0.3, ease: 'power3.in' }, '+=0.12')
    .to(veil, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55 }, '-=0.1')
    .set(veil, { autoAlpha: 0 })
}
