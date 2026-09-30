import { useSyncExternalStore } from 'react'

/** Глобальное состояние окна записи: любая кнопка «BOOK» открывает его, при желании — с выбранной услугой. */
type State = { open: boolean; service: string | null }
let state: State = { open: false, service: null }
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export const openBooking = (service: string | null = null) => { state = { open: true, service }; emit() }
export const closeBooking = () => { state = { ...state, open: false }; emit() }
export const useBooking = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => state, () => state)
