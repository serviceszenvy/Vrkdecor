import type { SVGProps } from 'react';

/**
 * Inline icons.
 *
 * Kept as local SVG rather than an icon dependency: the site needs a specific,
 * finite set of glyphs, and inlining them avoids shipping a library, a font or
 * a sprite request for something this small. They share one stroke weight and
 * one corner treatment so they read as a family.
 *
 * Every icon is `aria-hidden`; the accessible name always comes from the
 * control or heading it sits beside.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-5 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ shell */

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.6 3h3l1.5 4-2 1.5a12 12 0 0 0 5.4 5.4L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 6.2 2 2 0 0 1 6.6 3Z" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 7.3 5.1a1.2 1.2 0 0 0 1.4 0L20 7.5" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </Icon>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.48a9.8 9.8 0 0 0 4.69 1.2h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.78 9.78 0 0 0 12.04 2Zm0 1.8c2.15 0 4.17.84 5.69 2.36a7.98 7.98 0 0 1 2.36 5.68c0 4.44-3.61 8.04-8.05 8.04a8.05 8.05 0 0 1-4.1-1.12l-.3-.17-3.05.84.82-3-.2-.31a7.98 7.98 0 0 1-1.22-4.28c0-4.44 3.61-8.04 8.05-8.04Zm-2.2 4.02c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.7 2.6 4.13 3.55 2.02.8 2.43.64 2.87.6.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.73-1.78-.19-.46-.39-.4-.53-.4h-.46Z" />
    </svg>
  );
}

/* ------------------------------------------------------- brand qualities */

export function SparkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c.6 3.3 1.7 4.4 5 5-3.3.6-4.4 1.7-5 5-.6-3.3-1.7-4.4-5-5 3.3-.6 4.4-1.7 5-5Z" />
      <path d="M18.6 14.4c.28 1.5.78 2 2.28 2.28-1.5.28-2 .78-2.28 2.28-.28-1.5-.78-2-2.28-2.28 1.5-.28 2-.78 2.28-2.28Z" />
    </Icon>
  );
}

export function GemIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10l4 5-9 11L3 9l4-5Z" />
      <path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.2 2.9 7.6 7 9.8 4.1-2.2 7-5.6 7-9.8V5.8L12 3Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </Icon>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 4c-8.5 0-14 3.8-14 10a6 6 0 0 0 6 6c6.2 0 8-5.5 8-16Z" />
      <path d="M4.5 20C7 15 11 11.5 16 9.5" />
    </Icon>
  );
}

export function FlowerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3.2a2.9 2.9 0 0 1 0 5.8 2.9 2.9 0 0 1 0-5.8ZM12 15a2.9 2.9 0 0 1 0 5.8A2.9 2.9 0 0 1 12 15ZM20.8 12a2.9 2.9 0 0 1-5.8 0 2.9 2.9 0 0 1 5.8 0ZM9 12a2.9 2.9 0 0 1-5.8 0A2.9 2.9 0 0 1 9 12Z" />
    </Icon>
  );
}

export function TeamIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.4 14.6a5.5 5.5 0 0 1 3.1 4.9" />
    </Icon>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6c0 5-7.5 9.4-7.5 9.4Z" />
    </Icon>
  );
}

export function HeartSolidIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-4 shrink-0"
      {...props}
    >
      <path d="M12 20.5S3.8 15.6 3.8 10.1A4.6 4.6 0 0 1 12 7.3a4.6 4.6 0 0 1 8.2 2.8c0 5.5-8.2 10.4-8.2 10.4Z" />
    </svg>
  );
}

export function RingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="14.5" r="5" />
      <circle cx="15.5" cy="14.5" r="5" />
      <path d="M12 3.5 10 6h4l-2-2.5Z" />
    </Icon>
  );
}

export function CakeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v6Z" />
      <path d="M4 15.5c1.6 1.4 3.1 1.4 4.7 0s3.1-1.4 4.7 0 3.1 1.4 4.7 0M12 4v3.5" />
    </Icon>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="9" width="17" height="11" rx="2" />
      <path d="M3.5 13.5h17M12 9v11" />
      <path d="M12 9c-2.6 0-4-.9-4-2.3A2.2 2.2 0 0 1 12 6a2.2 2.2 0 0 1 4 .7C16 8.1 14.6 9 12 9Z" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </Icon>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V6.5L12 4v16M12 20V9.5L20 8v12M2.5 20h19" />
      <path d="M7 9v.01M7 12.5v.01M7 16v.01M16 12v.01M16 15.5v.01" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
      <path d="M9.5 20v-5.5h5V20" />
    </Icon>
  );
}

export function LampIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v3.5" />
      <path d="M7 11a5 5 0 0 1 10 0Z" />
      <path d="M10 14.5h4l-.6 5a1.5 1.5 0 0 1-1.4 1.2h0a1.5 1.5 0 0 1-1.4-1.2l-.6-5Z" />
    </Icon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 4 2.4 5 5.6.7-4 3.9 1 5.4-5-2.7-5 2.7 1-5.4-4-3.9 5.6-.7L12 4Z" />
    </Icon>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8Z" />
      <circle cx="12" cy="13" r="3.4" />
    </Icon>
  );
}

/* -------------------------------------------------- services & occasions */

/** A mandap or arch: two pillars under a curved canopy with a hanging lamp. */
export function ArchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V11a8 8 0 0 1 16 0v9" />
      <path d="M2.5 20h19M7 20v-7.5M17 20v-7.5" />
      <path d="M12 7.5v2.2M10.6 11.6a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0Z" />
    </Icon>
  );
}

/** A garland swag with hanging strands. */
export function GarlandIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6c2.5 6 5.5 8 9 8s6.5-2 9-8" />
      <path d="M7 11.5 6 15M12 14v4.5M17 11.5l1 3.5" />
      <circle cx="6" cy="16.5" r="1.3" />
      <circle cx="12" cy="20" r="1.3" />
      <circle cx="18" cy="16.5" r="1.3" />
    </Icon>
  );
}

/** A stage with a backdrop and lights. */
export function StageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 20h18M5 20v-4h14v4" />
      <path d="M6 16V7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5V16" />
      <path d="M9 9.5v.01M12 9.5v.01M15 9.5v.01" />
      <path d="M12 3v3" />
    </Icon>
  );
}

/** A decorated car, seen from the side. */
export function CarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 15.5 5.6 10a2 2 0 0 1 1.9-1.4h9a2 2 0 0 1 1.9 1.4L20 15.5" />
      <path d="M3 15.5h18v3H3z" />
      <circle cx="7.5" cy="18.5" r="1.6" />
      <circle cx="16.5" cy="18.5" r="1.6" />
      <path d="M10 5.5c.6-1.4 1.6-2 2-2s1.4.6 2 2" />
    </Icon>
  );
}

/** A church with a bell tower. */
export function ChurchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v4M10 5h4" />
      <path d="M8 20v-8l4-4 4 4v8" />
      <path d="M3 20h18M3 20v-6l5-2M21 20v-6l-5-2" />
      <path d="M10.5 20v-3.5a1.5 1.5 0 0 1 3 0V20" />
    </Icon>
  );
}

/** A pair of balloons on strings. */
export function BalloonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3.5a3.8 4.6 0 1 0 0 9.2 3.8 4.6 0 0 0 0-9.2Z" />
      <path d="M15.5 6a3 3.6 0 1 0 0 7.2 3 3.6 0 0 0 0-7.2Z" />
      <path d="M9 12.7c0 2.8 1 4.3 2 7.8M15.5 13.2c0 2.5-.6 3.6-1.5 5.8" />
    </Icon>
  );
}

/** Confetti and streamers. */
export function ConfettiIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 20 3.5-10L14 16.5 4 20Z" />
      <path d="M13 4.5c1.5 2 .5 3.5-1 4.5s-2.5 2.5-1 4.5" />
      <path d="M16 9.5c2-1 3.5 0 4.5 1.5" />
      <path d="M17.5 4v.01M20 6.5v.01M19 13.5v.01M9 4.5v.01" />
    </Icon>
  );
}

/** A microphone, for sound. */
export function MicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6" />
    </Icon>
  );
}

/** A chair, for furniture and seating. */
export function ChairIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 12V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V12" />
      <path d="M5 12h14v3.5H5z" />
      <path d="M6.5 15.5V20M17.5 15.5V20M7 12h10" />
    </Icon>
  );
}

/** A screen on a stand, for LED walls and displays. */
export function ScreenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4.5" width="18" height="11.5" rx="2" />
      <path d="M12 16v4M8.5 20h7" />
      <path d="m7 12.5 3-3 2.5 2 4.5-4" />
    </Icon>
  );
}

/** A clipboard with a tick, for full event management. */
export function ClipboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V3.5h6v1M9 4.5h6" />
      <path d="m8.5 13 2.4 2.4L15.5 10.5" />
    </Icon>
  );
}

/** The sun, for haldi and daytime ceremonies. */
export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </Icon>
  );
}

/** A palm, for beach and Kerala settings. */
export function PalmIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 21c.5-6 1.5-9.5 3-13" />
      <path d="M14 8c-3-2.5-6.5-2-9 .5 3-.6 5.5 0 7.5 1.5" />
      <path d="M14 8c-1-3.5.5-6 3.5-6-1 1.5-1.3 3.2-1 5" />
      <path d="M14 8c3.5-1.5 6.5 0 8 2.5-2.5-1-5-.8-7 .3" />
      <path d="M3 21h18" />
    </Icon>
  );
}

/** A ribbon rosette, for openings and launches. */
export function RibbonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="9" r="5" />
      <circle cx="12" cy="9" r="2" />
      <path d="m9 13.5-2 7 5-2.5 5 2.5-2-7" />
    </Icon>
  );
}

/** Lips and a brush, for makeup and styling. */
export function BrushIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m14 4 6 6-8.5 8.5a2.1 2.1 0 0 1-3 0L5.5 15.5a2.1 2.1 0 0 1 0-3L14 4Z" />
      <path d="m11 7 6 6M4 20c1.8-.2 3-.9 3.5-2.2" />
    </Icon>
  );
}

/** A serving cloche, for food and catering. */
export function ClocheIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 16a8 8 0 0 1 16 0Z" />
      <path d="M12 6.5V8M2.5 19h19" />
      <circle cx="12" cy="5.5" r="1" />
    </Icon>
  );
}

/** A baby rattle, for baby showers. */
export function RattleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8.5" r="4.5" />
      <path d="m12.2 11.7 6.3 6.3a1.6 1.6 0 0 1-2.3 2.3l-6.3-6.3" />
      <path d="M7.5 7.5c.4-.6 1-1 1.8-1" />
    </Icon>
  );
}

/** Two glasses raised, for parties and anniversaries. */
export function ToastIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 4 4 1-1.5 6.5a2.5 2.5 0 0 1-4.9-1.1L6 4Z" />
      <path d="m18 4-4 1 1.5 6.5a2.5 2.5 0 0 0 4.9-1.1L18 4Z" />
      <path d="m7 13-1.5 6.5M4 20h3.5M17 13l1.5 6.5M16.5 20H20" />
    </Icon>
  );
}

/* -------------------------------------------------------------- social */

export function InstagramIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M16.9 7.1v.01" />
    </Icon>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.46-4 4.14V9.9H7.6V13h2.7v8h3.2Z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M21.5 8.3a2.6 2.6 0 0 0-1.8-1.85C18.1 6 12 6 12 6s-6.1 0-7.7.45A2.6 2.6 0 0 0 2.5 8.3 27 27 0 0 0 2.05 12c0 1.24.15 2.48.45 3.7a2.6 2.6 0 0 0 1.8 1.85C5.9 18 12 18 12 18s6.1 0 7.7-.45a2.6 2.6 0 0 0 1.8-1.85c.3-1.22.45-2.46.45-3.7s-.15-2.48-.45-3.7ZM10.2 14.85v-5.7L15.1 12l-4.9 2.85Z" />
    </svg>
  );
}
