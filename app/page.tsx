import { siteConfig } from '@/lib/site-config';

/**
 * P1 foundation placeholder.
 * The real Home page is implemented in P4 — 04-PUBLIC-WEBSITE, on top of the
 * design system delivered in P2.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase">
        Foundation build
      </p>
      <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
        {siteConfig.name}
      </h1>
      <p className="text-neutral-600">{siteConfig.description}</p>
      <p className="text-sm text-neutral-500">
        Phase 1 foundation is in place. The public website is implemented in later,
        separately approved build phases.
      </p>
    </main>
  );
}
