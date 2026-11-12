# Monisha's birthday greeting

A React greeting card with a full-screen archery game, seven flying balloons, a five-hit unlock, a candle wish, an animated envelope, and a personal card with three photo memories.

## Run locally

Use Node.js 24 and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. The server binds to your own computer. The Full screen button enters browser fullscreen when supported.

## Build and preview

```sh
npm run build
npm run preview
```

The production files are in `dist/`. Stop the development server before previewing, since both commands use port 3000. The production build can be hosted as a static website.

## Checks

```sh
npm test
```

Playwright uses installed Microsoft Edge on Windows. On other systems, install Chromium first with `npx playwright install chromium`. Tests cover the five-hit gate, animated game, touch input, themes, fullscreen, photos, replay, and reduced-motion preferences.

## Project structure

- `src/App.jsx`: greeting stages, persistent theme selection, and shared controls.
- `src/components/ArcheryGame.jsx`: arrow physics, moving-target collision detection, score, and pop animation.
- `src/components/GreetingStages.jsx`: candle, opening envelope, and birthday letter.
- `src/components/PhotoMemories.jsx`: image selection, compression, carousel, and storage.
- `src/components/Controls.jsx`: theme dialog and browser fullscreen.
- `src/components/Effects.jsx`: starfield, fireworks, confetti, and pointer sparkles.
- `src/components/DepthScene.jsx`: layered planets, perspective scenery, and pointer-responsive card tilt.
- `src/hooks/useSound.js`: optional locally synthesized audio.
- `src/styles/`: greeting, futuristic, arena, and theme styles.
- `src/animations.css`: React animation styling.
- `tests/greeting.spec.js`: browser checks.

React owns the interaction state. Motion handles stage transitions, balloon-hit particles, score feedback, envelope opening, and photo transitions. Animation loops, audio, timers, and event listeners clean up when their components unmount.

The dimensional visuals use CSS perspective, SVG lighting, and Motion transforms: glossy balloon shading, a raised cake, a folding envelope flap, and a book-style card reveal. The archery collision plane stays flat so the decorative parallax never changes where an arrow hits. Touch input does not activate pointer tilt, and reduced-motion preferences disable decorative motion.

Arrow trails, expanding hit rings, floating score rewards, rising wish hearts, and a shimmering birthday name add feedback to each moment. Fireworks are limited to brief celebrations; particle counts are smaller on mobile. Decorative overlays ignore pointer input, and their timers and animation frames clean up on replay or unmount.

The five color palettes and three photos use the existing browser-local storage keys, so prior selections on the same origin remain available. Photos are resized locally and never uploaded. Browser storage is specific to the origin: `localhost:3000`, `127.0.0.1:3000`, and the original directly opened HTML file each have separate storage.

The game respects reduced-motion settings by keeping balloons stationary and simplifying decorative animations. Sound is off until enabled. Google Fonts are optional; system-font fallbacks are included.
