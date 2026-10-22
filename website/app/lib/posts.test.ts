import { describe, expect, it } from 'vitest'
import { toPost } from './posts'

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
