import { useCallback, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll } from './lib/motion'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Manifesto from './components/Manifesto'
import Services from './components/Services'
import Craft from './components/Craft'
import Barbers from './components/Barbers'
import Portfolio from './components/Portfolio'
import Booking from './components/Booking'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import BookingDialog from './components/BookingDialog'
import ProjectView from './components/ProjectView'

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    initSmoothScroll()
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    addEventListener('load', onLoad)
    return () => removeEventListener('load', onLoad)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a href="#services" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[500] focus:rounded-full focus:bg-milk focus:px-5 focus:py-3 focus:text-ink">Skip to services</a>
      <Preloader onDone={done} />
      <Cursor />
      <Navbar visible={ready} />
      <main>
        <Hero ready={ready} />
        <Manifesto />
        <Services />
        <Craft />
        <Barbers />
        <Portfolio />
        <Booking />
        <Testimonials />
      </main>
      <Footer />
      <BookingDialog />
      <ProjectView />
      {/* шторка переходов между разделами */}
      <div id="veil" aria-hidden className="pointer-events-none invisible fixed inset-0 z-[260] grid place-items-center bg-coal">
        <span data-veil-mark className="display text-[clamp(3rem,10vw,9rem)] text-milk">Black Jack<span className="text-brass">♠</span></span>
      </div>
      <div aria-hidden className="grain" />
    </MotionConfig>
  )
}
