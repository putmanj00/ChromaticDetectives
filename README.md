# Chromatic Detectives

Chromatic Detectives is a mobile-first, 15-stage GPS scavenger hunt with a detective theme, built as a React + TypeScript web app. Players walk to real locations around Cincinnati and Covington, solve small puzzles (radio tuning, matching, camera checks, ciphers), and collect shards to uncover a story. The look is inspired by 1990s neon rainbow sticker art.

## How it works

- Stages are defined in order in `lib/stages.ts`. Stage N+1 stays locked until stage N is completed.
- Most stages unlock by GPS: the player must be within a per-stage radius of the stage coordinate. Some stages add a puzzle (frequency dial, sequence taps, photo verification, trivia).
- Progress is stored in the browser (`localStorage`); there is no backend.
- Dev helpers: add `?mock=true` (and `&unlock=N`) to the hash URL, e.g. `/#/?mock=true&unlock=5`, to bypass GPS and pre-unlock stages. Tapping the home title three times opens an admin panel.

## Quickstart

```bash
npm install
cp .env.example .env.local   # then fill in the placeholders
npm run dev                  # http://localhost:3000
npm test                     # unit tests (vitest)
npm run typecheck
npm run lint
npm run build                # production build in dist/
npm run test:e2e             # Playwright (needs `npx playwright install`)
```

## API keys: what you need to supply

The app runs without any keys, but some features stay off until you supply your own. No keys are included in this repo, and the public live demo is deployed without any, so the map and the AI features are disabled there.

| Variable | Enables | Without it |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | World map screen (Google Maps JavaScript API) | The map does not load |
| `GEMINI_API_KEY` | Gemini features: video generation, radio voice, photo verification | Those stages fall back or fail; stages marked skippable can be skipped |
| `VITE_GOOGLE_AI_KEY` | Optional alternative Gemini key read by Stage 03 and the vision helper | `GEMINI_API_KEY` is used instead |

To enable everything:

1. Create a Google Maps JavaScript API key in Google Cloud Console and a Gemini API key in Google AI Studio.
2. Local development: copy `.env.example` to `.env.local` and fill in the values.
3. Hosted (for example Vercel): add the same variables in the project's environment settings, then redeploy. Keys are read at build time, so a new build is required after changing them.
4. Restrict each key before using it on a public site (see Security notes below).

GPS stages, puzzles, progress tracking and navigation need no keys.

## Security notes

Any API key set at build time is shipped to every visitor's browser. `vite.config.ts` compiles `GEMINI_API_KEY` into the bundle, and `screens/WorldMap.tsx` reads `VITE_GOOGLE_MAPS_API_KEY` the same way. Treat both as public. Use a restricted key (HTTP referrer restriction, API restriction, quota cap) and never a key that is shared with other projects. Do not commit `.env*` files; only `.env.example` is tracked.

## Customising

All stage locations, radii, hints and puzzle settings live in `lib/stages.ts`. Stage 01 ("Home") uses a placeholder coordinate in downtown Cincinnati; set it to the player's real home location. The other stages point at real businesses and landmarks in the Cincinnati area, so replace them if you run the hunt elsewhere. Stage 10 has a fixed countdown target in `screens/Stage10Fog.tsx`.

## Limits

- The AI-powered stages and the map need your own Gemini and Google Maps keys (see "API keys: what you need to supply"); without them those features fall back or fail.
- Keys are exposed in the client bundle (see Security notes); there is no server-side proxy.
- No backend: progress lives in one browser's `localStorage` and can be cleared or edited by the player.
- Locations, story and photos are specific to one hunt in the Cincinnati area; it is not a general-purpose hunt builder.
- Some images and videos are loaded from an external storage bucket (see `screens/ItemsScreen.tsx`) and the UI loads Tailwind from its CDN at runtime.
- GPS accuracy varies indoors; radii were chosen for urban walking and may need tuning.
- The Stage 10 countdown targets a fixed date and time that has already passed.

## License

MIT, see `LICENSE`.
