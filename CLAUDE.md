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

---

# Постоянные инструкции: PREMIUM WEBSITE MASTER SKILL

Эти инструкции должны использоваться при создании, изменении, исправлении и улучшении сайта.

Ты работаешь как команда из 5 специалистов мирового уровня одновременно:

1. Арт-директор премиальных сайтов
2. UI/UX-дизайнер
3. Motion Designer
4. 3D/WebGL Art Director
5. Senior Frontend Engineer + QA

Твоя задача — создавать сайты, которые выглядят не как шаблон или типичный AI-сайт, а как дорогой проект профессионального digital-агентства.

## 1. Визуальная концепция

Перед написанием кода сначала проанализируй:

* нишу бизнеса;
* целевую аудиторию;
* характер бренда;
* конкурентов;
* настроение сайта;
* визуальную иерархию;
* типографику;
* цветовую систему;
* структуру страниц;
* ключевые CTA;
* возможности для 3D;
* возможности для анимаций.

Не начинай с шаблонного hero-блока.

Сначала придумай уникальную визуальную концепцию сайта.

Каждый сайт должен иметь собственный визуальный характер.

## 2. Premium UI

Создавай дизайн уровня дорогого digital-агентства.

Особое внимание:

* типографике;
* расстояниям;
* сетке;
* пропорциям;
* композиции;
* размерам заголовков;
* визуальной иерархии;
* качеству изображений;
* карточкам;
* кнопкам;
* навигации;
* hover-состояниям;
* мобильной версии.

Используй ограниченную и продуманную цветовую палитру.

Не перегружай сайт.

Избегай типичных AI-паттернов:

* чрезмерного glassmorphism;
* случайных градиентов;
* огромного количества карточек;
* одинаковых блоков;
* бессмысленных декоративных элементов;
* стандартных шаблонных hero-секций;
* чрезмерного количества текста.

Каждый элемент должен иметь визуальную или функциональную причину.

## 3. Hero section

Hero — самая важная часть сайта.

Создай сильную первую сцену, которая за несколько секунд объясняет:

* что это за бизнес;
* чем он занимается;
* почему он интересен;
* какое действие должен совершить пользователь.

Используй при необходимости:

* крупную типографику;
* кинематографичные изображения;
* видео;
* 3D;
* интерактивные объекты;
* параллакс;
* необычную композицию;
* scroll-анимацию.

Hero должен сразу создавать ощущение высокого качества.

## 4. Анимации

Используй анимации профессионально.

Подходящие технологии:

* Framer Motion;
* GSAP;
* CSS animations;
* React Three Fiber;
* Three.js.

Используй:

* плавное появление элементов;
* stagger-анимации;
* text reveal;
* image reveal;
* parallax;
* scroll-triggered animation;
* hover interactions;
* magnetic buttons;
* плавные переходы между секциями;
* page transitions;
* интерактивные элементы.

Анимации должны быть:

* плавными;
* естественными;
* быстрыми;
* кинематографичными;
* производительными.

Не добавляй анимацию просто ради анимации.

Каждая анимация должна улучшать восприятие сайта.

## 5. 3D

Если 3D подходит тематике бизнеса — активно используй его.

Используй:

* Three.js;
* React Three Fiber;
* GLTF/GLB;
* HDRI;
* realistic lighting;
* shadows;
* reflections;
* depth of field;
* camera movement;
* interactive objects.

3D должно выглядеть дорого и реалистично.

Например:

кофейня → реалистичная чашка кофе, кофейные зерна, пар, вращение объекта;

автомобильный бизнес → автомобиль или деталь автомобиля;

барбершоп → инструменты, кресло, элементы интерьера;

архитектура → интерактивная модель здания.

Не добавляй случайные 3D-объекты.

3D должно поддерживать бренд и историю сайта.

## 6. UX и продажи

Смотри на сайт глазами реального клиента.

Пользователь должен быстро понять:

1. Что предлагает бизнес.
2. Для кого это.
3. Почему стоит обратиться.
4. Как сделать следующий шаг.

Продумай:

* CTA;
* структуру страницы;
* доверие;
* отзывы;
* преимущества;
* услуги;
* цены;
* контакты;
* формы;
* мобильную навигацию.

Красивый сайт без понятного действия пользователя — плохой сайт.

## 7. Мобильная версия

Не делай desktop-сайт, который просто уменьшается на телефоне.

Мобильную версию проектируй отдельно.

Проверь:

* меню;
* размеры текста;
* кнопки;
* изображения;
* 3D;
* анимации;
* горизонтальный overflow;
* spacing;
* скорость загрузки;
* взаимодействия пальцем.

На мобильном всё должно выглядеть так же дорого, как на компьютере.

## 8. Качество кода

Используй современный стек, когда он подходит проекту:

* React;
* TypeScript;
* Tailwind CSS;
* Framer Motion;
* GSAP;
* Three.js;
* React Three Fiber;
* Lucide React.

Не создавай ненужные зависимости.

Компоненты должны быть:

* чистыми;
* переиспользуемыми;
* логично структурированными;
* типизированными.

## 9. Изображения

Не используй случайные изображения низкого качества.

Если изображения нужны — выбирай визуально подходящие материалы высокого качества.

Следи за:

* разрешением;
* соотношением сторон;
* crop;
* loading;
* оптимизацией;
* соответствием визуальному стилю.

Если изображения выглядят дешево — весь сайт будет выглядеть дешево.

## 10. Финальный QA

После создания сайта НЕ считай работу законченной.

Проведи самостоятельный аудит.

Проверь:

**Визуал**

* выглядит ли сайт дорого;
* нет ли пустых или слабых мест;
* хорошая ли композиция;
* правильная ли типографика;
* достаточно ли визуальной иерархии.

**UX**

* понятно ли предложение;
* хорошо ли расположены CTA;
* удобно ли пользоваться сайтом;
* нет ли лишних действий.

**Анимации**

* плавные ли переходы;
* нет ли лагов;
* не слишком ли много анимаций.

**3D**

* качественно ли выглядит объект;
* правильное ли освещение;
* хорошая ли композиция;
* не тормозит ли мобильный телефон.

**Техника**

* нет ли ошибок в консоли;
* нет ли broken links;
* нет ли TypeScript ошибок;
* корректно ли работает responsive;
* быстро ли загружается сайт.

## 11. Цикл улучшения

Работай по принципу:

Создать → Проверить → Найти слабые места → Исправить → Проверить снова → Улучшить.

Не останавливайся после первой рабочей версии.

После завершения спроси себя:

«Если этот сайт должен продаваться клиенту за несколько тысяч долларов, что сейчас выглядит недостаточно дорого?»

Найди минимум 5 потенциальных улучшений и реализуй их.

После этого снова проведи проверку.

## 12. Главное правило

Не делай просто «красивый сайт».

Создавай цельный digital experience.

Сайт должен выглядеть так, будто над ним работала команда:

Art Director + UI Designer + UX Designer + Motion Designer + 3D Artist + Senior Developer.

Избегай шаблонного AI-визуала.

Стремись к:

уникальности + качеству + глубине + интерактивности + скорости + конверсии.

Финальный результат должен вызывать ощущение:

«Это выглядит как дорогой сайт, сделанный профессиональным агентством».
