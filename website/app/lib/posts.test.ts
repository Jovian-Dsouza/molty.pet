import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchThread, toPost } from './posts'

const tweet = {
  id_str: '2078107900359356547',
  created_at: '2026-07-17T13:21:47.000Z',
  text: 'Day 3 of building (molty) @moltypet &amp; https://t.co/gh https://t.co/vid',
  display_text_range: [0, 57],
  favorite_count: 50,
  conversation_count: 12,
  user: {
    name: 'Jovian Shilton Dsouza',
    screen_name: 'DsouzaJovian',
    profile_image_url_https: 'https://pbs.twimg.com/profile_images/1/a_normal.jpg',
  },
  entities: {
    hashtags: [],
    urls: [{ display_url: 'github.com/molty', expanded_url: 'https://github.com/molty', indices: [42, 57], url: 'https://t.co/gh' }],
    user_mentions: [{ id_str: '9', indices: [26, 35], name: 'Molty', screen_name: 'moltypet' }],
    symbols: [],
    media: [{ display_url: 'pic.x.com/vid', expanded_url: 'https://x.com/v', indices: [58, 74], url: 'https://t.co/vid' }],
  },
}

describe('toPost', () => {
  const post = toPost(tweet)!

  it('keeps the author, date, and engagement', () => {
    expect(post).toMatchObject({
      id: '2078107900359356547',
      name: 'Jovian Shilton Dsouza',
      handle: 'DsouzaJovian',
      date: '2026-07-17T13:21:47.000Z',
      likes: 50,
      replies: 12,
      url: 'https://x.com/DsouzaJovian/status/2078107900359356547',
    })
  })

  it('uses the larger avatar', () => {
    expect(post.avatar).toBe('https://pbs.twimg.com/profile_images/1/a_bigger.jpg')
  })

  it('drops media links from the text but keeps mentions as links', () => {
    const text = post.parts.map((p) => p.text).join('')
    expect(text).not.toContain('t.co')
    expect(post.parts).toContainEqual({ text: '@moltypet', href: 'https://x.com/moltypet' })
  })

  it('expands short links and decodes HTML entities', () => {
    expect(post.parts).toContainEqual({ text: 'github.com/molty', href: 'https://github.com/molty' })
    expect(post.parts.map((p) => p.text).join('')).toContain(' & ')
  })

  it('rejects payloads that are not posts', () => {
    expect(toPost(null)).toBeNull()
    expect(toPost({ id_str: '1', text: 'hi' })).toBeNull()
    expect(toPost({ ...tweet, user: { name: 'No handle' } })).toBeNull()
  })

  it('treats a missing reply count as zero', () => {
    expect(toPost({ ...tweet, conversation_count: undefined })?.replies).toBe(0)
  })
})

describe('fetchThread', () => {
  const reply = {
    ...tweet,
    id_str: '2078200000000000000',
    text: '@DsouzaJovian Day 3 and my legs already work better than my jokes.',
    display_text_range: [14, 67],
    entities: {},
    user: { ...tweet.user, name: 'Molty', screen_name: 'moltypet' },
  }

  const stubX = (byId: Record<string, unknown>) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const body = byId[new URL(url).searchParams.get('id') ?? '']
        return body ? new Response(JSON.stringify(body)) : new Response('', { status: 404 })
      }),
    )

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('pairs a post with Molty’s reply', async () => {
    stubX({ [tweet.id_str]: tweet, [reply.id_str]: reply })
    const thread = await fetchThread({ id: tweet.id_str, reply: reply.id_str })
    expect(thread?.post.id).toBe(tweet.id_str)
    expect(thread?.reply?.handle).toBe('moltypet')
    expect(thread?.reply?.parts.map((p) => p.text).join('')).toBe('Day 3 and my legs already work better than my jokes.')
  })

  it('keeps the post when the reply is missing or fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    stubX({ [tweet.id_str]: tweet })
    expect((await fetchThread({ id: tweet.id_str }))?.reply).toBeNull()
    expect((await fetchThread({ id: tweet.id_str, reply: '404' }))?.reply).toBeNull()
  })

  it('drops the thread when the post itself fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    stubX({ [reply.id_str]: reply })
    expect(await fetchThread({ id: tweet.id_str, reply: reply.id_str })).toBeNull()
  })
})
