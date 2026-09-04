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

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 4.5l15 7.5-15 7.5 3-7.5-3-7.5Z" strokeLinejoin="round" />
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
