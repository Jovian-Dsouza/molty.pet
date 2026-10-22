#!/usr/bin/env node
/**
 * Generates the teardown section's audio from app/teardown.ts with ElevenLabs:
 * one sound effect as each stage starts and one Molty line as it finishes.
 *
 *   ELEVENLABS_API_KEY=... node scripts/voice/generate-teardown-audio.mjs [--force]
 *
 * Writes public/audio/teardown/<id>-sfx.mp3 and <id>-line.mp3. Existing clips
 * are kept unless --force.
 */

import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { TEARDOWN } from '../../app/teardown.ts'
import { durationMs, requireApiKey, soundEffect, synthesize } from './elevenlabs.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT_DIR = path.join(ROOT, 'public/audio/teardown')
/** Long enough for the gesture, short enough not to talk over Molty. */
const SFX_SECONDS = 1.6

async function make(file, force, label, generate) {
  if (force || !existsSync(file)) {
    console.log(`  ${label}`)
    await generate(file)
  }
  console.log(`    ${path.relative(ROOT, file)} ${await durationMs(file)} ms`)
}

async function main() {
  const apiKey = requireApiKey()
  const force = process.argv.includes('--force')
  await mkdir(OUT_DIR, { recursive: true })

  const clips = [...TEARDOWN.stages, { id: 'reassembled', ...TEARDOWN.reassembled }]
  for (const { id, line, sfx } of clips) {
    console.log(id)
    if (sfx) await make(path.join(OUT_DIR, `${id}-sfx.mp3`), force, `sfx  ${sfx}`, (f) => soundEffect(apiKey, sfx, SFX_SECONDS, f))
    if (line) await make(path.join(OUT_DIR, `${id}-line.mp3`), force, `line ${line}`, (f) => synthesize(apiKey, 'molty', line, f))
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
