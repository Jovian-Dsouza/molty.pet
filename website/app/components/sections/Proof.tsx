import { LAUNCH_VIDEO, PROOF } from '@/app/content'

export function Proof() {
  return (
    <section id="proof" className="section scroll-mt-20">
      <div className="site-shell">
        <div className="proof-head">
          <h2 className="section-title">{PROOF.title}</h2>
          <p className="section-copy">{PROOF.body}</p>
        </div>

        <figure className="media-frame mt-10">
          <video
            controls
            playsInline
            preload="metadata"
            poster={LAUNCH_VIDEO.poster}
            className="block aspect-video w-full bg-background object-cover"
            aria-label={LAUNCH_VIDEO.label}
          >
            <source src={LAUNCH_VIDEO.src} type="video/mp4" />
          </video>
          <figcaption className="media-caption">{PROOF.caption}</figcaption>
        </figure>
      </div>
    </section>
  )
}
