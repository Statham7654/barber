import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW_PATH)
const [w, h] = process.argv[2].split('x').map(Number)
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 1000, hasTouch: w < 1000 })).newPage()
await p.goto('http://127.0.0.1:5400/', { waitUntil: 'load' }); await p.waitForTimeout(3500)
const shots = []
for (const [sel, f] of [['#top', 0], ['#about', 1.2], ['#craft', 0.9], ['#team', 0.1], ['#book', 0.2]]) {
  await p.evaluate(([s, f]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + f * innerHeight) }, [sel, f]); await p.waitForTimeout(1800)
  const f2 = `tools/out/vp_${w}_${sel.slice(1)}.png`; await p.screenshot({ path: f2 }); shots.push(f2)
}
console.log(shots.join(' ')); await b.close()
