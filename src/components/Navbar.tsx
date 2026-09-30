import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { nav, ADDRESS, HOURS, LINKS } from '../lib/data'
import { goTo, lockScroll } from '../lib/motion'
import { openBooking } from '../lib/booking'
import Magnetic from './Magnetic'

const EASE = [0.76, 0, 0.24, 1] as const

/** Плавающая навигация: появляется после загрузки; при скролле сжимается, получает blur и графитовый фон. На мобильном — полноэкранное меню. */
export default function Navbar({ visible }: { visible: boolean }) {
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => setCompact(scrollY > 60)
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [open])

  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault()
    const wasOpen = open
    setOpen(false)
    setTimeout(() => goTo(target), wasOpen ? 450 : 0)
  }

  return (
    <>
      <motion.header
        initial={{ y: -110, opacity: 0 }} animate={visible ? { y: 0, opacity: 1 } : {}} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="fixed inset-x-0 top-0 z-[120] pt-[env(safe-area-inset-top)]"
      >
        <div className={`gutter transition-[padding] duration-700 ease-[var(--ease-out-expo)] ${compact ? 'pt-3' : 'pt-4 md:pt-7'}`}>
          <div className={`mx-auto flex items-center justify-between rounded-full border transition-[background-color,border-color,padding,backdrop-filter] duration-700 ease-[var(--ease-out-expo)] ${compact ? 'border-milk/10 bg-ink/60 py-2 pl-5 pr-2 backdrop-blur-xl md:pl-7' : 'border-transparent bg-transparent py-2 pl-0 pr-0'}`}>
            <a href="#top" onClick={(e) => go(e, '#top')} aria-label="BLACK JACK BARBERS — back to top" className="display flex items-baseline gap-2 whitespace-nowrap text-[1.5rem] leading-none text-milk md:text-[1.75rem]">
              Black Jack<span aria-hidden className="text-[0.8em] text-brass">♠</span>
            </a>
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="m-0 flex list-none items-center gap-9 p-0">
                {nav.map((n) => (
                  <li key={n.label}>
                    <a href={n.target} onClick={(e) => go(e, n.target)} className="group relative block overflow-hidden py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-milk/80 transition-colors hover:text-milk">
                      <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">{n.label}</span>
                      <span aria-hidden className="absolute inset-x-0 top-full block py-2 text-brass transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">{n.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-2">
              <span className="hidden min-[400px]:block"><Magnetic strength={0.25}>
                <button onClick={() => openBooking()} className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-full bg-milk px-5 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink">
                  <span aria-hidden className="absolute inset-0 translate-y-full rounded-full bg-brass transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0" />
                  <span className="relative">Book now</span><span aria-hidden className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
                </button>
              </Magnetic></span>
              <button ref={btn} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative z-[130] grid h-11 w-11 place-items-center rounded-full border border-milk/20 lg:hidden">
                <span className="relative block h-2.5 w-5">
                  <span className={`absolute left-0 top-0 h-px w-full bg-milk transition-transform duration-500 ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
                  <span className={`absolute bottom-0 left-0 h-px w-full bg-milk transition-transform duration-500 ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div id="menu" role="dialog" aria-modal="true" aria-label="Menu"
            className="fixed inset-0 z-[110] flex flex-col justify-between bg-coal px-[clamp(16px,4vw,72px)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-28 lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }} animate={{ clipPath: 'inset(0% 0% 0% 0%)' }} exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.8, ease: EASE }}>
            <ul className="m-0 list-none p-0">
              {nav.map((n, i) => (
                <li key={n.label} className="overflow-hidden border-b border-milk/10">
                  <motion.a href={n.target} onClick={(e) => go(e, n.target)}
                    className="display flex items-baseline justify-between py-2 text-[clamp(3.4rem,17vw,6rem)] text-milk"
                    initial={{ y: '105%' }} animate={{ y: 0 }} exit={{ y: '105%' }} transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
                    {n.label}<span className="font-mono text-xs tracking-[0.16em] text-muted">0{i + 1}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="grid gap-6">
              <button onClick={() => { setOpen(false); setTimeout(() => openBooking(), 450) }} className="flex h-14 items-center justify-between rounded-full bg-milk px-6 font-mono text-sm uppercase tracking-[0.16em] text-ink">
                Book appointment <span aria-hidden>→</span>
              </button>
              <div className="flex items-end justify-between">
                <p className="meta m-0">{ADDRESS}<br />{HOURS.days} · {HOURS.time}</p>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="meta flex items-center gap-1 !text-milk">Instagram <ArrowUpRight size={14} aria-hidden /></a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
