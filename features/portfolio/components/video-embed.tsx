import type { PortfolioVideo } from '../types';

/**
 * Optional video / reel — Requirements section 8 and 10.
 *
 * Phase 1 stores external provider URLs rather than uploads (Master
 * Implementation Specification section 18). Only known providers are embedded,
 * and an unrecognised or unparseable URL degrades to a plain link rather than
 * injecting an arbitrary iframe source.
 */
function youTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1) || null;
    if (!parsed.hostname.endsWith('youtube.com')) return null;
    if (parsed.pathname.startsWith('/embed/'))
      return parsed.pathname.split('/')[2] ?? null;
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

export function VideoEmbed({ video }: { video: PortfolioVideo }) {
  const id = video.provider === 'youtube' ? youTubeId(video.url) : null;

  if (!id) {
    return (
      <a
        className="text-accent-300 inline-flex min-h-11 items-center underline underline-offset-4"
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {video.caption ?? 'Watch the reel'}
      </a>
    );
  }

  return (
    <figure className="flex flex-col gap-2">
      <div className="bg-surface-muted relative aspect-video overflow-hidden rounded-lg">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
          title={video.caption ?? 'Design video'}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {video.caption ? (
        <figcaption className="text-ink-muted text-sm">{video.caption}</figcaption>
      ) : null}
    </figure>
  );
}
