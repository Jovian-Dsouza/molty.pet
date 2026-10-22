import Image from 'next/image'
import { ArrowUpRight, Heart, MessageCircle, Trophy } from 'lucide-react'
import { LINKS, SOCIAL } from '@/app/content'
import { fetchPost, fetchThread, type Post, type Thread } from '@/app/lib/posts'
import { SectionHeading } from '../SectionHeading'

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const countFormat = new Intl.NumberFormat('en-US', { notation: 'compact' })

function PostText({ post, className = '' }: { post: Post; className?: string }) {
  return (
    <p className={`whitespace-pre-line ${className}`}>
      {post.parts.map((part, i) =>
        part.href ? (
          <a key={i} href={part.href} target="_blank" rel="noreferrer" className="post-link">
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  )
}

function Author({ post, size }: { post: Post; size: 24 | 40 }) {
  return (
    <>
      {post.avatar && (
        <Image
          src={post.avatar}
          alt=""
          width={size}
          height={size}
          className="shrink-0 rounded-full border border-border"
          style={{ width: size, height: size }}
        />
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold">{post.name}</p>
        <p className="truncate text-sm text-muted-foreground">@{post.handle}</p>
      </div>
    </>
  )
}

/** Molty's own reply, nested under the post it answered. */
function MoltyReply({ reply }: { reply: Post }) {
  return (
    <div className="post-reply">
      <header className="flex items-center gap-2.5 text-sm">
        <Author post={reply} size={24} />
        <a href={reply.url} target="_blank" rel="noreferrer" className="post-reply-tag focus-ring">
          {SOCIAL.molty.replied}
        </a>
      </header>
      <PostText post={reply} className="mt-2 text-[0.9375rem] leading-6" />
    </div>
  )
}

function PostCard({ post, reply = null }: Thread | { post: Post; reply?: null }) {
  return (
    <article className="post-card">
      <header className="flex items-center gap-3">
        <Author post={post} size={40} />
      </header>

      <PostText post={post} className="mt-4 leading-7" />
      {reply && <MoltyReply reply={reply} />}
      <div className="flex-1" />

      <footer className="post-meta">
        <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
        <span className="inline-flex items-center gap-1.5">
          <Heart aria-hidden="true" className="size-3.5" />
          {countFormat.format(post.likes)}
          <span className="sr-only">likes</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle aria-hidden="true" className="size-3.5" />
          {countFormat.format(post.replies)}
          <span className="sr-only">replies</span>
        </span>
        <a href={post.url} target="_blank" rel="noreferrer" className="post-open focus-ring">
          View on X
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </footer>
    </article>
  )
}

function Milestone() {
  const { milestone } = SOCIAL
  return (
    <article className="post-card milestone-card">
      <div className="milestone-photo">
        <Image src={milestone.image} alt={milestone.imageAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" />
      </div>
      <Trophy aria-hidden="true" className="size-6 text-primary" />
      <p className="mt-5 text-sm text-muted-foreground">{milestone.event}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{milestone.result}</p>
      <p className="mt-3 flex-1 leading-7 text-muted-foreground">{milestone.body}</p>
      <a href={milestone.href} target="_blank" rel="noreferrer" className="post-open focus-ring mt-6 self-start">
        {milestone.cta}
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </a>
    </article>
  )
}

/** Posts from people talking about Molty. Renders nothing until there are some. */
function Praise({ posts }: { posts: readonly Post[] }) {
  if (posts.length === 0) return null
  return (
    <div className="mt-16">
      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{SOCIAL.praise.title}</h3>
      <div className="post-wall mt-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

const isPresent = <T,>(value: T | null): value is T => value !== null

/** Build-in-public wall: real posts from X with Molty's own replies, what people say, and milestones. */
export async function Social() {
  const [threads, praise] = await Promise.all([
    Promise.all(SOCIAL.posts.map(fetchThread)).then((all) => all.filter(isPresent)),
    Promise.all(SOCIAL.praise.posts.map(fetchPost)).then((all) => all.filter(isPresent)),
  ])

  return (
    <section id="social" className="section scroll-mt-20">
      <div className="site-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={SOCIAL.title} />
          <a href={LINKS.productX} target="_blank" rel="noreferrer" className="button button-secondary">
            {SOCIAL.follow}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>

        <div className="post-wall mt-12">
          {threads.map((thread) => (
            <PostCard key={thread.post.id} {...thread} />
          ))}
          <Milestone />
        </div>

        <Praise posts={praise} />
      </div>
    </section>
  )
}
