# BLACK JACK BARBERS — website

One-page dark-luxury editorial site for a Kyiv barbershop. React 19 + TypeScript + Vite 8 + Tailwind CSS v4, animations with GSAP/ScrollTrigger + Motion (`motion/react`), smooth scroll with Lenis, one 3D object with React Three Fiber + drei. All copy is English.

## Commands

```bash
npm install
npm run dev                  # Vite dev server
npm run build                # tsc --noEmit && vite build → dist/
npx tsc --noEmit             # type-check only
SINGLE=1 npx vite build      # everything inlined into one dist/index.html (used for claude.ai artifact publishing)
```

There is no test runner. Browser checks live in `tools/*.mjs` (Playwright, run against the dev server on port 5400):
`PW_PATH=$(npm root -g)/playwright node tools/qa.mjs` — clicks through booking, nav, project view, testimonials, mobile menu, reduced motion; prints PASS/FAIL and console errors. `tools/tour.mjs d|m` — section screenshots; `tools/overflow.mjs` — horizontal overflow at 11 viewports; `tools/at.mjs` — screenshot of one section. Output goes to `tools/out/`.

## Structure

- `src/App.tsx` — section order and global layers (preloader, cursor, navbar, booking dialog, project view, `#veil` transition curtain, grain).
- `src/components/` — one file per section: `Preloader`, `Navbar`, `Hero`, `Manifesto` (#about), `Services`, `Craft` (3D razor), `Barbers` (#team), `Portfolio` (#work), `Booking` (#book), `Testimonials`, `Footer` (#contact); plus `BookingDialog`, `ProjectView`, `Cursor`, `Magnetic`.
- `src/lib/data.ts` — **all content**: services (name/desc/time/price in UAH), barbers, portfolio items + their grid layout, reviews, nav, address, hours, links.
- `src/lib/media.ts` — **all images** in one place. To use real photos, drop a file in `src/assets/img/` and change the import + `w/h/alt`.
- `src/lib/booking.ts` — tiny external store; any button calls `openBooking(serviceName?)`.
- `src/lib/motion.ts` — Lenis init, `lockScroll()`, `goTo(selector)` (section jump behind the `#veil` curtain).
- `src/lib/store.ts` — mutable `craft` state written from DOM/GSAP and read in `useFrame` (no React re-renders).
- `src/three/RazorScene.tsx` — lazy-loaded R3F canvas; loads `src/assets/models/razor.glb` (meshopt). Materials are overridden in code by material name (`Steel`/`Ebony`/`Brass`). The `Handle` node rotates on its pivot: in this model `rotation.y = 0` is open and `π` is closed.
- `studio/` — Blender (bpy 4.2) pipeline that produced every image and the GLB: `python3 studio/studio.py <shot> [samples]`, `python3 studio/studio.py glb`, then `node studio/images.mjs` (PNG → WebP crops in `src/assets/img/`). Not part of the site build.

## Design system (don't drift from it)

- Tokens in `src/styles.css` `@theme`: `ink #080808`, `coal #111111`, `milk #F2F0EA`, `muted #8A8A8A`, `brass #B8A07A`.
- Type: `.display` = Archivo Variable, `wdth 62`, weight 800, uppercase, tight leading — all big headings. `.display-wide` = Archivo `wdth 125` light. `.meta` = Geist Mono uppercase labels. Section labels follow the `(0N) — Name` pattern.
- Motion vocabulary: mask reveals (`.mask` + `yPercent: 110 → 0`), `expo.out` / `cubic-bezier(0.16,1,0.3,1)`, clip-path reveals, magnetic buttons, custom cursor modes via `data-cursor="view|arrow|drag"`.

## Conventions and gotchas

- Every GSAP effect goes in `useLayoutEffect` with `gsap.matchMedia()` / `gsap.context()` and is reverted in cleanup; wrap scroll animations in `(prefers-reduced-motion: no-preference)`.
- Pinned sections (`Manifesto`, `Craft`, `Barbers` on ≥768px) use ScrollTrigger `pin: true`; changing their height/content requires checking the sections after them.
- Base element resets in `styles.css` must stay inside `@layer base`. Unlayered rules override Tailwind utilities (this once made every `bg-milk` button transparent).
- Touch devices: no custom cursor, no mouse parallax, services expand inline instead of the cursor-follow preview; navbar links collapse into the fullscreen menu below `lg`.
- The booking form is a design preview — it does not send anything anywhere. Names, handles, prices, reviews and the address are placeholders.
- Keep the page free of horizontal overflow from 320px to 2560px (`tools/overflow.mjs`).
