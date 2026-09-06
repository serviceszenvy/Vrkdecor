type IconProps = { name: string; className?: string };

const paths: Record<string, React.ReactNode> = {
  sparkle: <path d="M12 3l1.9 5.4L19 10.3l-5.1 1.9L12 17.6l-1.9-5.4L5 10.3l5.1-1.9L12 3z" />,
  arch: (
    <>
      <path d="M5 20V11a7 7 0 0 1 14 0v9" />
      <path d="M3 20h18" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 9.6V5m0 13.4V14m2.4-2h4.4m-13.6 0h4.4m4.3-3.7l2.6-2.6M6.3 17.7l2.6-2.6m6.8 2.6l2.6 2.6M6.3 6.3l2.6 2.6" />
    </>
  ),
  gate: (
    <>
      <path d="M4 21V8l8-4 8 4v13" />
      <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
    </>
  ),
  brush: (
    <>
      <path d="M15.5 3.5l5 5L11 18H6v-5z" />
      <path d="M3 21c1.2-.6 2-1.6 2.3-3" />
    </>
  ),
  bolt: <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2.2 5.3-5.3 2.2 2.2-5.3z" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 20a6 6 0 0 0-2-4.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.4-2.4a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.4 2.4a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </>
  ),
  arrow: <path d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />,
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5l1.3-4.2A8.2 8.2 0 1 1 8 19.4l-4.5 1.1z" />
      <path d="M9 9.2c.3 2.2 2.4 4.5 4.8 5.2.6.2 1.3 0 1.6-.6l.3-.6-2-1-.6.7c-1-.4-2-1.4-2.4-2.5l.8-.5-.9-2-.7.2c-.6.2-1 .8-.9 1.1z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.8 6.5L12 12.6l8.2-6.1" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5L19.5 7" />,
  quote: (
    <path d="M9.5 6.5C6.8 7.7 5 10.2 5 13.2c0 2.7 1.6 4.3 3.7 4.3 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3-3-3h-.4c.2-1.5 1.2-2.7 2.6-3.4zm9 0c-2.7 1.2-4.5 3.7-4.5 6.7 0 2.7 1.6 4.3 3.7 4.3 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3-3-3h-.4c.2-1.5 1.2-2.7 2.6-3.4z" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="M6 9l6 6 6-6" />,
};

export default function Icon({ name, className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={name === "sparkle" || name === "bolt" || name === "quote" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.sparkle}
    </svg>
  );
}
