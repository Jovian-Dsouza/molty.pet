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

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { SCENARIOS } from '../../app/scenarios.ts'

const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT_DIR = path.join(ROOT, 'public/voice')
const MANIFEST = path.join(ROOT, 'app/voice-lines.json')
const API = 'https://api.elevenlabs.io/v1/text-to-speech'
const OUTPUT_FORMAT = 'mp3_44100_128'
const LOUDNESS = 'loudnorm=I=-16:TP=-1.5:LRA=11'

/** Voices in the ElevenLabs library. Override with env vars to recast. */
const VOICES = {
  you: {
    id: process.env.ELEVENLABS_YOU_VOICE_ID ?? 'Wg9tQPGmiNUCWMmaCEaC',
    model: 'eleven_multilingual_v2',
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.1 },
  },
  molty: {
    id: process.env.ELEVENLABS_MOLTY_VOICE_ID ?? 'MKFRAolX19CwxqZ1qLZ8',
    model: 'eleven_v3',
    settings: { stability: 0.5, similarity_boost: 0.75 },
  },
}

const run = promisify(execFile)

async function durationMs(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
  const seconds = Number.parseFloat(stdout)
  if (!Number.isFinite(seconds)) throw new Error(`ffprobe could not read a duration from ${file}`)
  return Math.round(seconds * 1000)
}

async function synthesize(apiKey, role, text, file) {
  const voice = VOICES[role]
  const res = await fetch(`${API}/${voice.id}?output_format=${OUTPUT_FORMAT}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: voice.model, voice_settings: voice.settings }),
  })
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status} for "${text}": ${await res.text()}`)
  }
  const raw = `${file}.raw.mp3`
  await writeFile(raw, Buffer.from(await res.arrayBuffer()))
  await normalize(raw, file)
  await rm(raw)
}

/** Both voices land at the same loudness, so neither needs its own volume. */
async function normalize(input, output) {
  await run('ffmpeg', ['-v', 'error', '-y', '-i', input, '-af', LOUDNESS, '-ar', '44100', '-b:a', '64k', output])
}

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
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('Set ELEVENLABS_API_KEY to generate voice lines.')
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
