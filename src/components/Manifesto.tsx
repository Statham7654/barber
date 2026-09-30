import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const LINES = [['We', 'don’t', 'just'], ['cut', 'hair.'], ['We', 'create'], ['your', 'signature.']]

/**
 * Манифест: секция закрепляется, слова проявляются одно за другим (blur + подъём + яркость) синхронно со скроллом.
 * Последнее слово — латунью: это подпись, ради которой всё.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const words = gsap.utils.toArray<HTMLElement>('[data-m-word]')
      gsap.set(words, { opacity: 0.08, filter: 'blur(10px)', yPercent: 30 })
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=170%', pin: true, scrub: 0.7, anticipatePin: 1 } })
      words.forEach((w, i) => tl.to(w, { opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 0.4, ease: 'power2.out' }, i * 0.22))
      tl.fromTo('[data-m-side]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, words.length * 0.22 - 0.2)
        .fromTo('[data-m-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'none' }, 0)
        .to({}, { duration: 0.4 })
    })
    return () => mm.revert()
  }, [])

  let n = 0
  return (
    <section id="about" ref={root} className="relative flex min-h-[100svh] flex-col justify-center bg-ink py-24" aria-labelledby="m-h">
      <div className="gutter">
        <div className="mb-10 flex items-center gap-4 md:mb-14">
          <span className="meta">(01) — About</span>
          <span data-m-rule className="hairline block flex-1 origin-left" />
        </div>
        <h2 id="m-h" className="display m-0 text-[clamp(3.4rem,min(12vw,17svh),15rem)] leading-[0.86] text-milk">
          {LINES.map((line, li) => (
            <span key={li} className={`block ${li % 2 ? 'md:pl-[16vw]' : ''}`}>
              {line.map((w) => {
                const last = ++n === 9
                return <span key={w + n} data-m-word className={`mr-[0.18em] inline-block will-change-transform ${last ? 'text-brass' : ''}`}>{w}</span>
              })}
            </span>
          ))}
        </h2>
        <div data-m-side className="mt-10 md:absolute md:bottom-[12svh] md:right-[clamp(16px,4vw,72px)] md:mt-0">
          <p className="m-0 max-w-[36ch] text-[1rem] leading-relaxed text-muted">
            Black Jack is a private-club barbershop in the heart of Kyiv. Four chairs, no rush, no conveyor.
            Every cut starts with a conversation and ends with a line you’ll recognise in the mirror for weeks.
          </p>
        </div>
      </div>
    </section>
  )
}
