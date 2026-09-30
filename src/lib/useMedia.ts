import { useEffect, useState } from 'react'

/** Реактивный matchMedia: нужен, чтобы рендерить только нужную композицию (телефон или десктоп), а не обе сразу. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    const m = matchMedia(query)
    const on = () => setMatch(m.matches)
    on(); m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}
