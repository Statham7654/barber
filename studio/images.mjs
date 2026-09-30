// Рендеры Blender → WebP для сайта (+ кадрирование вариантов для команды и портфолио)
import sharp from 'sharp'
const src = (n) => `studio/out/${n}.png`, out = (n) => `src/assets/img/${n}.webp`
const q = { quality: 80, effort: 5 }
async function save(name, from, { w, h, zoom = 1, fx = 0.5, fy = 0.5, grade = true } = {}) {
  const img = sharp(src(from)); const m = await img.metadata()
  let pipe = img
  if (w && h) {
    // кадрируем окно нужных пропорций с масштабом zoom вокруг точки (fx, fy)
    const ar = w / h
    let cw = Math.min(m.width, Math.round(m.height * ar)), ch = Math.round(cw / ar)
    ch = Math.min(ch, m.height); cw = Math.min(cw, m.width); cw = Math.round(cw / zoom); ch = Math.round(ch / zoom)
    const left = Math.max(0, Math.min(m.width - cw, Math.round(m.width * fx - cw / 2)))
    const top = Math.max(0, Math.min(m.height - ch, Math.round(m.height * fy - ch / 2)))
    pipe = pipe.extract({ left, top, width: cw, height: ch }).resize(w, h)
  }
  if (grade) pipe = pipe.modulate({ saturation: 0.9 }).linear(1.04, -3)
  const r = await pipe.webp(q).toFile(out(name))
  console.log(name, r.width + 'x' + r.height, (r.size / 1024).toFixed(0) + 'KB')
}
await save('hero', 'hero', { w: 1920, h: 1080 })
await save('hero-m', 'hero_m', { w: 1080, h: 1620 })
for (const n of ['haircut', 'beard', 'combo', 'kids', 'royal']) await save(n, n, { w: 900, h: 1125 })
await save('razor', 'razor_macro', { w: 1600, h: 1000 })
await save('team-mark', 'haircut', { w: 800, h: 1000, zoom: 1.5, fx: 0.62, fy: 0.55 })
await save('team-denys', 'combo', { w: 800, h: 1000, zoom: 1.6, fx: 0.35, fy: 0.62 })
await save('team-artem', 'razor_macro', { w: 800, h: 1000, zoom: 1.05, fx: 0.55, fy: 0.5 })
await save('team-ivan', 'bottle_portrait', { w: 800, h: 1000 })
await save('work-a', 'flatlay', { w: 1600, h: 1000 })
await save('work-b', 'haircut', { w: 800, h: 1000, zoom: 1.25, fx: 0.4, fy: 0.4 })
await save('work-c', 'royal', { w: 800, h: 1200, zoom: 1.1 })
await save('work-d', 'kids', { w: 1000, h: 800 })
await save('work-e', 'razor_macro', { w: 1600, h: 900, zoom: 1.3, fx: 0.4 })
