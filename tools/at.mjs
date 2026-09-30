// Скриншот по id секции + смещение: node tools/at.mjs d|m '#craft' 0.5 out.png
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW_PATH)
const [mode, sel, frac, out, url] = [process.argv[2], process.argv[3], process.argv[4] || '0', process.argv[5], process.argv[6] || 'http://127.0.0.1:5400/']
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext(mode === 'm' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(3500)
for (const f of String(frac).split(',').map(Number)) {
  await p.evaluate(([s, f]) => { const el = document.querySelector(s); const top = el.getBoundingClientRect().top + scrollY; window.scrollTo(0, top + f * innerHeight) }, [sel, f]); await p.waitForTimeout(2200)
  await p.screenshot({ path: out.replace('.png', `_${f}.png`) })
}
await b.close()
