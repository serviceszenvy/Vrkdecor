/** The logo's leaf / ellipse line-art motif, reused as a section rule. */
export default function LeafDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className="shell" aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        className="leaf-rule"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
        data-reveal="scale"
      >
        <path
          className="draw-path"
          style={{ ["--len" as string]: 1400 }}
          d="M0 44 C 260 44 340 12 600 12 C 860 12 940 44 1200 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <ellipse cx="600" cy="12" rx="26" ry="9" transform="rotate(-18 600 12)" />
          <path d="M574 16 C 586 22 596 24 608 24" />
        </g>
      </svg>
    </div>
  );
}
