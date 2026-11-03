# Craftech360 — Homepage V5

V3 makes targeted improvements to the existing Next.js homepage. The approved hero choreography and 3D geometry remain byte-for-byte unchanged. The portfolio, capabilities, process, people and footer layouts are retained.

## Run and review

Node.js 20.9+ is required. Dependencies and a lockfile are included.

```sh
npm install
npm run build
npm start -- --port 3001
```

Open **http://localhost:3001/**. Port 3000 may still contain the previous preview. The V5 production review server uses 3001.

For development: `npm run dev`. If macOS denies Turbopack FSEvents access, use `WATCHPACK_POLLING=true npm run dev -- --webpack --port 3002`. The production build and preview work without a filesystem watcher.

## Interact

1. Begin at the top: only type and navigation are visible. Chakra Petch 700 provides compact geometric display headings and technology names; the existing Manrope body and IBM Plex Mono annotations are retained. Fonts and OFL licenses are self-hosted.
2. Scroll normally, or select “Scroll to change perspective.” On desktop the pinned opening occupies 500vh total: a 100vh frame plus 400vh of scrolling. Typography holds, the core emerges, rings articulate, the camera orbits, and then travels through the open centre.
3. At the inspection stage, drag the sculpture. Horizontal touch drags inspect; vertical gestures retain normal scrolling. Arrow keys rotate the focused sculpture; Home resets. Drag is a separate local transform with damped inertia. Resuming scroll blends it back to the intended pose.
4. The two small controls pause/resume idle motion and reset inspection. Pause does not prevent scrolling through the story.
5. Scroll backwards to reverse the sequence. Use “Skip the intro” to reach the warm-white introduction directly. Navigation to later sections bypasses the intro normally.
6. Below 900px, a shorter 265vh total opening uses a distant, simpler camera move, lower DPR, no bloom, and no realtime shadows. There is no camera fly-through on mobile.
7. OS reduced-motion preference removes the pinned camera story: type, a static core, and the introduction flow normally. Unavailable WebGL or a scene error displays an original SVG concept instead.
8. Existing project/product dialogs and the capability accordion remain functional. Start a project prepares a downloadable text brief; it never sends an enquiry.

## Source map

- `components/CinematicHero.tsx`: opening overlays, GSAP/ScrollTrigger orchestration, controls, fallback, transition into the existing introduction.
- `components/cinematic/KineticCore.tsx`: bevelled annular segments, nested gimbals, pivot joints, suspended panelled core, inspection damping.
- `components/cinematic/CameraRig.tsx`: continuous Catmull–Rom camera path and look-at target, plus the separate mobile path.
- `components/cinematic/Lighting.tsx`: a generated studio reflection environment, white/cool fills, restrained orange rim light, resource cleanup.
- `components/cinematic/PostEffects.tsx`: low-strength thresholded bloom, desktop only.
- `components/cinematic/PointerController.ts`: pointer capture, touch direction arbitration, keyboard inspection, listener cleanup.
- `components/cinematic/motion.ts`: shared ref-based motion state; scrolling does not rerender the page.
- `components/Sculpture.tsx`: one persistent R3F Canvas, offscreen rendering suspension, DPR and shadow settings.
- `app/page.tsx`: retained content and sections.
- `app/cinematic.css` / `app/fonts.css`: V2 design rules and self-hosted font declarations.

## Production content still needed

The C360 Kinetic Core is an original conceptual model, not a real Craftech360 product. All other abstract product/project/studio visuals remain labeled placeholders. No employee identities, specifications, results, or testimonials are invented. Official logo, approved product footage/models, project media/case studies, real studio photography, verified social profiles, and a business enquiry destination/backend are still needed before public launch.

This is a local preview, not a public deployment. No 60 FPS guarantee or formal accessibility certification is claimed. Native mobile touch behaviour, reduced-motion OS switching, WebGL-disabled devices, and performance on physical low-end hardware should receive device testing before launch.

## V3 technology exhibition

`components/TechnologyExhibition.tsx` replaces the moving card track with an exhibition. `components/technologies/ExhibitionScene.tsx` builds six stationary concept compositions in a continuous 3D room. A Catmull–Rom camera path pans, dollies, and changes its viewing angle as GSAP scrubs a shared progress ref. The last exhibit pulls back before the section releases into Selected Work. Product captions are a separate screen-space layer; they never move with the 3D camera or sit inside a horizontally clipped card. Container-aware display sizing accommodates every name. The caption changes once per exhibit; transforms use frame-based refs.

Desktop scrolling drives the gallery. Index buttons and previous/next controls seek within the same timeline. Mobile and reduced motion remove gallery pinning and provide direct selection; mobile uses a more distant, simpler camera path. All compositions are explicitly conceptual and stationary: none assert the real mechanics of Craftech360 products. Authentic approved models and media are still required.

## V3 conversation panel

`components/ConversationPanel.tsx` opens from the Start the Conversation CTA or a product/project detail view. An orange boundary precedes a masked panel reveal and staggered fields. Closing reverses the sequence, then releases scroll lock and restores focus. Escape, keyboard focus containment, underlined focus states, validation, mobile full-screen layout and reduced-motion presentation are implemented. Form values persist in page memory while reviewing. They are not stored on a server.

Let's Connect validates the brief and explicitly reports that delivery is not connected. A valid brief can be downloaded as a text file. No successful enquiry transmission is claimed.

V3 styles are isolated in `app/refinements.css`. Chakra Petch and its OFL license are self-hosted in `public/assets/fonts`. Existing body font rules remain unchanged.

## V4 editorial opening

The overlap came from independently absolute-positioned headline and paragraph containers with percentage-based top offsets. Font and viewport height changes could make those boxes collide. V4 replaces these offsets with one intrinsic grid: label, a two-line headline, a separate supporting-copy row, and a footer invitation. Height-aware display type keeps short viewports usable. The body font remains Manrope.

`app/hero-editorial.css` scopes the new opening layout. `components/cinematic/OpeningOrbit.tsx` supplies a lightweight SVG motion study; no additional WebGL scene is created. Slow partial-orbit rotation, a tracking point, a faint pointer-responsive grid and a thin editorial rule provide restrained movement. Pointer response is limited to graphics on desktop. Reduced-motion preferences disable graphic motion.

The initial layer remains hidden until GSAP installs its starting masks, preventing a full-headline hydration flash; a noscript rule retains readable content without JavaScript. The opening runs approximately 2.6 seconds. The existing scrubbed timeline controls the graphics' departure and scroll indicator, with no additional ScrollTrigger. The scene reveal times, 3D geometry, camera rig, lighting, inspection controls and technology exhibition source remain unchanged.

## V5 project journey and contact playground

Our Work is now `components/WorkJourney.tsx`, with a lazy-loaded Three.js scene in `components/work/WorkJourneyScene.tsx`. Five flat image planes sit at asymmetric x/y/z positions and angles. A scrubbed Catmull–Rom camera path pans, tracks vertically, changes perspective and finishes with a pull-back. The planes remain flat: future authentic photographs will not be turned into fictitious installations. Foreground/background media layers provide depth. Captions occupy a separate CSS grid row outside the WebGL viewport, preventing text/image collisions. Index buttons, previous/next, the page navigation and a continue link provide direct access and exit. The timeline reverses with scrolling.

Mobile and reduced motion use a normal vertical gallery with all five titles, visuals and preview actions. `components/work/data.ts` is the project-content source. Original abstract SVG graphic placeholders are in `public/assets/projects/*-concept.svg`, and are explicitly labeled as non-footage. Replace them with approved project media before launch. The project preview panel shows the corresponding graphic and the missing-asset disclosure, with a path into the existing enquiry panel.

`components/ContactPlayground.tsx` implements Ideas in Motion using lightweight SVG. It animates only when in view, responds to pointer movement on desktop and arrow keys when focused, and offers gather/release plus reset controls. Pressing Bring Ideas Together changes the composition; it never submits information. Start the Conversation opens the existing validated enquiry prototype. The contact graphics respect reduced motion and normal touch scrolling. `app/work-contact.css` contains the new scoped styles.

Approved CinematicHero, camera, core, editorial orbit, Technologies scene/gallery, and ConversationPanel files are unchanged (verified by SHA checks). No real project footage, outcomes, testimonials or employee identities were invented. Public launch still requires authentic project assets, case studies, enquiry delivery, and physical-device performance testing.

# test
