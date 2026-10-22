#!/usr/bin/env node
/**
 * Generates the hero stage's voice clips from app/scenarios.ts with ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... node scripts/voice/generate-voice-lines.mjs [--force]
 *
 * Writes public/voice/<scene>-you.mp3 and <scene>-molty.mp3, plus
 * app/voice-lines.json with each clip's length so the stage can time the
 * scene without loading audio. Existing clips are kept unless --force.
 */

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { SCENARIOS } from '../../app/scenarios.ts'
import { durationMs, requireApiKey, synthesize } from './elevenlabs.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT_DIR = path.join(ROOT, 'public/voice')
const MANIFEST = path.join(ROOT, 'app/voice-lines.json')

async function clip(apiKey, role, text, id, force) {
  if (!text) return 0
  const file = path.join(OUT_DIR, `${id}-${role}.mp3`)
  if (force || !existsSync(file)) {
    console.log(`  ${role.padEnd(5)} ${text}`)
    await synthesize(apiKey, role, text, file)
  }
  return durationMs(file)
}

async function main() {
  const apiKey = requireApiKey()
  const force = process.argv.includes('--force')

  await mkdir(OUT_DIR, { recursive: true })
  const manifest = {}
  for (const scene of SCENARIOS) {
    console.log(`${scene.time} ${scene.id}`)
    manifest[scene.id] = {
      youMs: await clip(apiKey, 'you', scene.you, scene.id, force),
      moltyMs: await clip(apiKey, 'molty', scene.molty, scene.id, force),
    }
  }
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Wrote ${path.relative(ROOT, MANIFEST)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
