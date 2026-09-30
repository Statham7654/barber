import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { ADDRESS, HOURS, LINKS } from '../lib/data'
import { goTo } from '../lib/motion'

const links = [
  { label: 'Instagram', href: LINKS.instagram, ext: true },
  { label: 'Telegram', href: LINKS.telegram, ext: true },
  { label: 'Google Maps', href: LINKS.maps, ext: true },
  { label: 'Contact', href: LINKS.email, ext: false },
]

/** Большой минималистичный футер: цитата, ссылки, адрес и огромный логотип, который «вырастает» из-под края экрана. */
export default function Footer() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-f-line]', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.fromTo('[data-f-mark]', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-f-mark]', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } })
    })
    return () => mm.revert()
  }, [])

  return (
    <footer id="contact" ref={root} className="relative overflow-hidden bg-ink pt-[14vh]">
      <div className="gutter grid gap-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="meta mb-8">(08) — Contact</p>
          <p className="display m-0 text-[clamp(2.6rem,7vw,7.5rem)] text-milk">
            <span className="mask"><span data-f-line className="block">Crafted for men</span></span>
            <span className="mask"><span data-f-line className="block text-brass">who know their style.</span></span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 md:col-span-4 md:col-start-9 md:self-end">
          <div>
            <p className="meta m-0 mb-4">Follow</p>
            <ul className="m-0 grid list-none gap-1 p-0">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group flex min-h-10 items-center gap-1 text-milk transition-colors hover:text-brass">
                    {l.label}<ArrowUpRight size={14} aria-hidden className="opacity-50 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="meta m-0 mb-4">Visit</p>
            <p className="m-0 uppercase leading-relaxed text-milk">{ADDRESS}</p>
            <p className="m-0 mt-3 font-mono text-sm leading-relaxed text-muted">{HOURS.days}<br />{HOURS.time}</p>
          </div>
        </div>
      </div>

      <div className="gutter mt-[12vh] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-milk/10 py-6">
        <p className="meta m-0">© 2026 BLACK JACK BARBERS</p>
        <button onClick={() => goTo('#top')} className="meta flex min-h-11 items-center gap-2 !text-milk hover:!text-brass">Back to top ↑</button>
      </div>
      <p aria-hidden data-f-mark className="display m-0 select-none whitespace-nowrap text-center text-[11.6vw] leading-[0.8] text-milk/[0.07]">Black Jack Barbers</p>
    </footer>
  )
}
