import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, Check } from 'lucide-react'
import { services, barbers, uah, HOURS } from '../lib/data'
import { useBooking, closeBooking } from '../lib/booking'
import { lockScroll } from '../lib/motion'
import { useFocusTrap } from '../lib/useFocusTrap'

const EASE = [0.76, 0, 0.24, 1] as const
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
const today = () => new Date().toISOString().slice(0, 10)

/** Запись: панель выезжает справа (на телефоне — на весь экран). Выбор услуги, барбера, даты и времени, контакты. */
export default function BookingDialog() {
  const { open, service } = useBooking()
  const [svc, setSvc] = useState(services[0].name)
  const [barber, setBarber] = useState('Any barber')
  const [sent, setSent] = useState<string | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(open, panel)

  useEffect(() => {
    lockScroll(open)
    if (!open) { const t = setTimeout(() => setSent(null), 700); return () => clearTimeout(t) }
    if (service) setSvc(service)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && closeBooking()
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open, service])

  const chosen = services.find((s) => s.name === svc)!
  const field = 'w-full border-b border-milk/20 bg-transparent py-3 text-[1rem] text-milk outline-none transition-colors placeholder:text-muted/70 focus:border-brass [color-scheme:dark]'
  const chip = (on: boolean) => `min-h-11 rounded-full border px-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors ${on ? 'border-brass bg-brass text-ink' : 'border-milk/20 text-milk hover:border-milk/60'}`

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[250] flex justify-end bg-ink/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} onClick={closeBooking}>
          <motion.div ref={panel} role="dialog" aria-modal="true" aria-labelledby="bd-h" data-lenis-prevent onClick={(e) => e.stopPropagation()}
            className="relative h-full w-full max-w-[640px] overflow-y-auto overscroll-contain bg-coal px-6 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] md:px-12 md:pt-10"
            initial={{ clipPath: 'inset(0% 0% 0% 100%)' }} animate={{ clipPath: 'inset(0% 0% 0% 0%)' }} exit={{ clipPath: 'inset(0% 0% 0% 100%)' }} transition={{ duration: 0.8, ease: EASE }}>
            <div className="flex items-center justify-between">
              <span className="meta">{HOURS.days} · {HOURS.time}</span>
              <button onClick={closeBooking} aria-label="Close booking" className="grid h-12 w-12 place-items-center rounded-full border border-milk/20 text-milk hover:border-brass hover:text-brass"><X size={18} /></button>
            </div>

            {sent ? (
              <div className="mt-[18vh]">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brass text-ink"><Check size={22} /></span>
                <h2 id="bd-h" className="display m-0 mt-8 text-[clamp(3rem,10vw,5.5rem)] text-milk">See you in<br /><span className="text-brass">the chair, {sent}.</span></h2>
                <p className="mt-6 max-w-[40ch] text-muted">This is a design preview, so the request wasn’t sent anywhere. Connect a booking service (Altegio, Booksy, Fresha) to make this form live.</p>
                <button onClick={closeBooking} className="mt-10 flex h-12 items-center rounded-full border border-milk/30 px-6 font-mono text-xs uppercase tracking-[0.16em] text-milk hover:border-brass">Close</button>
              </div>
            ) : (
              <form className="mt-10" onSubmit={(e) => { e.preventDefault(); setSent(String(new FormData(e.currentTarget).get('name') || 'friend')) }}>
                <h2 id="bd-h" className="display m-0 text-[clamp(3rem,10vw,5.5rem)] text-milk">Book<br /><span className="text-brass">your chair</span></h2>

                <fieldset className="m-0 mt-10 border-0 p-0">
                  <legend className="meta mb-4">Service</legend>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => <button type="button" key={s.name} aria-pressed={svc === s.name} onClick={() => setSvc(s.name)} className={chip(svc === s.name)}>{s.name}</button>)}
                  </div>
                  <p className="mt-4 flex justify-between font-mono text-sm text-muted"><span>{chosen.time}</span><span className="text-milk">{uah(chosen.price)}</span></p>
                </fieldset>

                <fieldset className="m-0 mt-8 border-0 p-0">
                  <legend className="meta mb-4">Barber</legend>
                  <div className="flex flex-wrap gap-2">
                    {['Any barber', ...barbers.map((b) => b.name)].map((n) => <button type="button" key={n} aria-pressed={barber === n} onClick={() => setBarber(n)} className={chip(barber === n)}>{n}</button>)}
                  </div>
                </fieldset>

                <div className="mt-8 grid grid-cols-2 gap-6">
                  <label className="grid gap-1"><span className="meta">Date</span><input name="date" type="date" required min={today()} className={field} /></label>
                  <label className="grid gap-1"><span className="meta">Time</span>
                    <select name="time" required defaultValue="" className={field}><option value="" disabled>Choose</option>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
                  </label>
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <label className="grid gap-1"><span className="meta">Name</span><input name="name" required autoComplete="given-name" placeholder="Your name" className={field} /></label>
                  <label className="grid gap-1"><span className="meta">Phone</span><input name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+380" className={field} /></label>
                </div>
                <button type="submit" className="group relative mt-10 flex h-16 w-full items-center justify-between overflow-hidden rounded-full bg-milk px-8 font-mono text-sm uppercase tracking-[0.16em] text-ink">
                  <span aria-hidden className="absolute inset-0 -translate-x-full bg-brass transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-0" />
                  <span className="relative">Request appointment</span><span aria-hidden className="relative">→</span>
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
