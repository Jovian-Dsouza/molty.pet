import Image from 'next/image'
import { ArrowUpRight, Heart, MessageCircle, Trophy } from 'lucide-react'
import { LINKS, SOCIAL } from '@/app/content'
import { fetchPost, type Post } from '@/app/lib/posts'
import { SectionHeading } from '../SectionHeading'

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const countFormat = new Intl.NumberFormat('en-US', { notation: 'compact' })

function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <header className="flex items-center gap-3">
        {post.avatar && (
          <Image src={post.avatar} alt="" width={40} height={40} className="size-10 rounded-full border border-border" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{post.name}</p>
          <p className="truncate text-sm text-muted-foreground">@{post.handle}</p>
        </div>
      </header>

      <p className="mt-4 flex-1 whitespace-pre-line leading-7">
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

/** Build-in-public wall: real posts from X, plus milestones. */
export async function Social() {
  const posts = (await Promise.all(SOCIAL.posts.map(fetchPost))).filter((p): p is Post => p !== null)

  return (
    <section id="social" className="section scroll-mt-20">
      <div className="site-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={SOCIAL.title}>
            <p>{SOCIAL.body}</p>
          </SectionHeading>
          <a href={LINKS.productX} target="_blank" rel="noreferrer" className="button button-secondary">
            {SOCIAL.follow}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>

        <div className="post-wall mt-12">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <Milestone />
        </div>
      </div>
    </section>
  )
}
