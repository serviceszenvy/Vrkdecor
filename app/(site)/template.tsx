import type { ReactNode } from 'react';

/**
 * Page transition.
 *
 * A template re-mounts on every navigation, unlike a layout, so the entrance
 * animation on this wrapper replays each time the visitor moves between
 * pages. The animation is CSS only (`.page-enter` in `app/globals.css`), is
 * collapsed to an instant under `prefers-reduced-motion`, and touches nothing
 * about routing or data.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
