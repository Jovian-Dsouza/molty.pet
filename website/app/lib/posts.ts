/**
 * Public X posts for the build-log wall, read from the same syndication
 * endpoint X's own embeds use. No auth; fetched on the server at build time.
 */

export interface PostPart {
  text: string
  href?: string
}

export interface Post {
  id: string
  name: string
  handle: string
  avatar: string
  /** ISO timestamp. */
  date: string
  likes: number
  replies: number
  url: string
  parts: readonly PostPart[]
}

const ENDPOINT = 'https://cdn.syndication.twimg.com/tweet-result'
/** Refresh like and reply counts at most once a day. */
const REVALIDATE_S = 86_400

type Json = Record<string, unknown>

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const list = (v: unknown): Json[] => (Array.isArray(v) ? v.filter(isObject) : [])

function decodeEntities(text: string): string {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

interface Span {
  start: number
  end: number
  part: PostPart
}

function spans(entities: Json): Span[] {
  const at = (e: Json): [number, number] | null => {
    const [start, end] = Array.isArray(e.indices) ? e.indices : []
    return typeof start === 'number' && typeof end === 'number' ? [start, end] : null
  }
  const out: Span[] = []
  for (const e of list(entities.user_mentions)) {
    const range = at(e)
    const name = str(e.screen_name)
    if (range && name) out.push({ start: range[0], end: range[1], part: { text: `@${name}`, href: `https://x.com/${name}` } })
  }
  for (const e of list(entities.urls)) {
    const range = at(e)
    const href = str(e.expanded_url)
    if (range && href) out.push({ start: range[0], end: range[1], part: { text: str(e.display_url) ?? href, href } })
  }
  for (const e of list(entities.hashtags)) {
    const range = at(e)
    const tag = str(e.text)
    if (range && tag) out.push({ start: range[0], end: range[1], part: { text: `#${tag}`, href: `https://x.com/hashtag/${tag}` } })
  }
  return out.sort((a, b) => a.start - b.start)
}

/** Splits the visible text into plain runs and links. Indices count code points. */
function textParts(text: string, range: [number, number], entities: Json): PostPart[] {
  const chars = Array.from(text)
  const [from, to] = range
  const parts: PostPart[] = []
  let cursor = from
  for (const span of spans(entities)) {
    if (span.start < cursor || span.end > to) continue
    if (span.start > cursor) parts.push({ text: decodeEntities(chars.slice(cursor, span.start).join('')) })
    parts.push(span.part)
    cursor = span.end
  }
  if (cursor < to) parts.push({ text: decodeEntities(chars.slice(cursor, to).join('')) })
  return parts
}

/** Narrows an untrusted syndication payload to a Post, or null if it is not one. */
export function toPost(raw: unknown): Post | null {
  if (!isObject(raw) || !isObject(raw.user)) return null
  const id = str(raw.id_str)
  const text = str(raw.text)
  const date = str(raw.created_at)
  const handle = str(raw.user.screen_name)
  if (!id || !text || !date || !handle) return null

  const [start, end] = Array.isArray(raw.display_text_range) ? raw.display_text_range : []
  const range: [number, number] =
    typeof start === 'number' && typeof end === 'number' ? [start, end] : [0, Array.from(text).length]

  return {
    id,
    name: str(raw.user.name) ?? handle,
    handle,
    avatar: (str(raw.user.profile_image_url_https) ?? '').replace('_normal.', '_bigger.'),
    date,
    likes: num(raw.favorite_count),
    replies: num(raw.conversation_count),
    url: `https://x.com/${handle}/status/${id}`,
    parts: textParts(text, range, isObject(raw.entities) ? raw.entities : {}),
  }
}

/** The token X's embed script sends with each request. */
function embedToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '')
}

export async function fetchPost(id: string): Promise<Post | null> {
  const url = `${ENDPOINT}?id=${encodeURIComponent(id)}&lang=en&token=${embedToken(id)}`
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_S } })
    if (!res.ok) {
      console.error(`Post ${id}: X returned ${res.status}`)
      return null
    }
    const post = toPost(await res.json())
    if (!post) console.error(`Post ${id}: unexpected response shape`)
    return post
  } catch (error: unknown) {
    console.error(`Post ${id}: fetch failed`, error)
    return null
  }
}
