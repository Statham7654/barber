// Скриншоты по секциям + ошибки консоли. node tools/tour.mjs [d|m] [url]
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW_PATH)
const mode = process.argv[2] || 'd', url = process.argv[3] || 'http://127.0.0.1:5400/'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext(mode === 'm' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('[' + m.type() + ']', m.text().slice(0, 240)) })
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(4500)
await p.screenshot({ path: `tools/out/${mode}_00.png` })
const H = await p.evaluate(() => document.documentElement.scrollHeight), vh = mode === 'm' ? 844 : 900
let i = 1
for (let y = vh * 0.9; y < H; y += vh * 0.9) {
  await p.mouse.wheel(0, 0)
  await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(1300)
  if (mode === 'd') await p.mouse.move(700 + (i % 3) * 120, 420)
  await p.screenshot({ path: `tools/out/${mode}_${String(i).padStart(2, '0')}.png` }); i++
}
console.log('H', H, 'shots', i, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
await b.close()
