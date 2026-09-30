import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW_PATH || 'playwright')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const sizes = [[320, 640], [360, 780], [390, 844], [430, 932], [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]]
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  await p.goto('http://127.0.0.1:5400/', { waitUntil: 'load' }); await p.waitForTimeout(3500)
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  let worst = 0, worstY = 0
  for (let y = 0; y < H; y += 500) {
    await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(35)
    const d = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    if (d > worst) { worst = d; worstY = y }
  }
  // элементы, выходящие за правую границу (кроме заведомо внутри overflow-x контейнеров)
  const offenders = await p.evaluate(() => {
    const vw = innerWidth, res = []
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width && r.right > vw + 2 && getComputedStyle(el).position !== 'fixed') {
        let p = el.parentElement, clipped = false
        while (p && p !== document.body) { const o = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) { clipped = true; break } p = p.parentElement }
        if (!clipped) res.push(el.tagName + '.' + String(el.className).slice(0, 40))
      }
    })
    return [...new Set(res)].slice(0, 4)
  })
  console.log(`${w}x${h}`.padEnd(10), 'H', H, '| overflow-x px:', worst, worst ? `(at y=${worstY})` : '', offenders.length ? '| off: ' + offenders.join(', ') : '', errs.length ? '| ERR ' + errs[0] : '')
  await ctx.close()
}
await b.close()
