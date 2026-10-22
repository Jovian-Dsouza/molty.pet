/**
 * ElevenLabs + ffmpeg helpers shared by the voice and sound scripts.
 * Every clip is loudness-normalised so the page never needs per-clip volumes.
 */

import { execFile } from 'node:child_process'
import { rm, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const API = 'https://api.elevenlabs.io/v1'
const OUTPUT_FORMAT = 'mp3_44100_128'
const LOUDNESS = 'loudnorm=I=-16:TP=-1.5:LRA=11'

/** Voices in the ElevenLabs library. Override with env vars to recast. */
export const VOICES = {
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

export function requireApiKey() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('Set ELEVENLABS_API_KEY to generate audio.')
  return apiKey
}

export async function durationMs(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
  const seconds = Number.parseFloat(stdout)
  if (!Number.isFinite(seconds)) throw new Error(`ffprobe could not read a duration from ${file}`)
  return Math.round(seconds * 1000)
}

async function post(apiKey, url, body, what) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status} for ${what}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Writes `audio` to `file` at the shared loudness, via a temporary raw file. */
async function saveNormalized(audio, file, extraFilters = []) {
  const raw = `${file}.raw.mp3`
  await writeFile(raw, audio)
  const filters = [...extraFilters, LOUDNESS].join(',')
  try {
    await run('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', filters, '-ar', '44100', '-b:a', '64k', file])
  } finally {
    await rm(raw, { force: true })
  }
}

/** Speaks `text` in one of VOICES and saves it to `file`. */
export async function synthesize(apiKey, role, text, file) {
  const voice = VOICES[role]
  if (!voice) throw new Error(`Unknown voice role "${role}"`)
  const audio = await post(
    apiKey,
    `${API}/text-to-speech/${voice.id}?output_format=${OUTPUT_FORMAT}`,
    { text, model_id: voice.model, voice_settings: voice.settings },
    `"${text}"`,
  )
  await saveNormalized(audio, file)
}

/** Generates a sound effect from a text prompt and saves it to `file`, faded out at the end. */
export async function soundEffect(apiKey, prompt, seconds, file) {
  const audio = await post(
    apiKey,
    `${API}/sound-generation?output_format=${OUTPUT_FORMAT}`,
    { text: prompt, duration_seconds: seconds, prompt_influence: 0.6 },
    `sound "${prompt}"`,
  )
  const fade = Math.min(0.25, seconds / 4)
  await saveNormalized(audio, file, [`afade=t=out:st=${(seconds - fade).toFixed(2)}:d=${fade.toFixed(2)}`])
}
