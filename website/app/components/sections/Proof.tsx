import { LAUNCH_VIDEO, PROOF } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function Proof() {
  return (
    <section id="proof" className="section section-alt scroll-mt-20">
      <div className="site-shell split-layout">
        <SectionHeading kicker={PROOF.kicker} title={PROOF.title}>
          <p>{PROOF.body}</p>
        </SectionHeading>

        <figure className="media-frame">
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
