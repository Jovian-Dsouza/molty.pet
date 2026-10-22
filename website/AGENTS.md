<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

## Hero stage

The hero's scenes live in `app/scenarios.ts`. After changing a spoken line, regenerate its clip and timing with `ELEVENLABS_API_KEY=… node scripts/voice/generate-voice-lines.mjs` (needs `ffmpeg`; existing clips are kept unless `--force`). Never commit the key; keep it in the gitignored `.env.local`.

## Teardown section

Copy, Molty's lines and sound prompts live in `app/teardown.ts`; regenerate audio with `node scripts/voice/generate-teardown-audio.mjs --force`. `public/models/molty-parts.glb` comes from `scripts/cad/export_parts.py` (a `cadgen` interpreter, reading the Sesame STEP in the sibling `sesame-robot` repo); its node names must match `app/components/teardown/parts.ts`. The Sesame CAD's ESP32 board and switch are not Molty's hardware; the Pi Zero 2 W and PCA9685 are modelled in that script.
