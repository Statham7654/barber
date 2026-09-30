import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { work } from '../lib/data'
import { openProject } from './ProjectView'

/**
 * Работы: асимметричная редакционная сетка (большое / маленькое / вертикальное / широкое).
 * Каждый кадр раскрывается маской и живёт на своей скорости параллакса. Клик — переход в проект (clip-path из карточки).
 */
export default function Portfolio() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-w-line]', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.utils.toArray<HTMLElement>('[data-w-item]').forEach((el, i) => {
        const frame = el.querySelector('[data-w-frame]')!, img = el.querySelector('img')!
        gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
        gsap.fromTo(img, { scale: 1.35 }, { scale: 1.1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
        if (matchMedia('(min-width: 768px)').matches) {
          const k = work[i].speed * 70
          gsap.fromTo(el, { y: -k }, { y: k, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
        }
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="work" ref={root} className="relative bg-ink pb-[16vh] pt-[16vh] md:pb-[24vh] md:pt-[22vh]" aria-labelledby="w-h">
      <div className="gutter">
        <div className="mb-14 flex flex-col justify-between gap-6 md:mb-24 md:flex-row md:items-end">
          <h2 id="w-h" className="display m-0 text-[clamp(4rem,15vw,19rem)] text-milk">
            <span className="mask"><span data-w-line className="block">Recent</span></span>
            <span className="mask"><span data-w-line className="block outline md:pl-[10vw]">Work</span></span>
          </h2>
          <p className="meta m-0 max-w-[30ch] md:mb-4 md:text-right">(05) — Selected cuts, shaves and rituals from the chair this season.</p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-12 md:gap-y-[8vh]">
          {work.map((w, i) => (
            <figure key={w.title} data-w-item className={`group relative m-0 ${w.layout}`}>
              <button type="button" data-cursor="view" onClick={(e) => openProject(i, (e.currentTarget.querySelector('[data-w-frame]') as HTMLElement).getBoundingClientRect())}
                className="block w-full text-left" aria-label={`View project: ${w.title}`}>
                <div data-w-frame className="relative overflow-hidden rounded-sm bg-coal" style={{ aspectRatio: `${w.img.w} / ${w.img.h}` }}>
                  <img src={w.img.src} width={w.img.w} height={w.img.h} alt={w.img.alt} loading="lazy" decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] will-change-transform group-hover:!scale-[1.05]" />
                  <div aria-hidden className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/45" />
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 md:translate-y-4 md:opacity-0 md:transition-[opacity,transform] md:duration-700 md:ease-[var(--ease-out-expo)] md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                    <span className="display text-[clamp(1.8rem,3vw,3.2rem)] text-milk">{w.title}</span>
                    <span className="hidden shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-milk md:block">View project →</span>
                  </div>
                </div>
                <figcaption className="mt-3 flex justify-between">
                  <span className="meta">0{i + 1} / {w.tag}</span>
                  <span className="meta md:hidden">View project →</span>
                </figcaption>
              </button>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
