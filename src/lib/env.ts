export const isBrowser = typeof window !== 'undefined'
export const isCoarse = isBrowser && matchMedia('(pointer: coarse)').matches
export const reducedMotion = isBrowser && matchMedia('(prefers-reduced-motion: reduce)').matches

export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}
/** 3D только там, где он не будет тормозить: есть WebGL и не совсем слабое устройство */
export const canWebGL = isBrowser && hasWebGL() && (() => {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return (nav.deviceMemory ?? 8) > 2 && (navigator.hardwareConcurrency ?? 4) > 2
})()
