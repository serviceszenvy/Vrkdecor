import { cn } from '@/lib/cn';

/**
 * The botanical corner decoration used on the closing call to action and the
 * value band, matching the approved reference design.
 *
 * Purely decorative and therefore hidden from assistive technology. Drawn as
 * inline SVG rather than an image so it inherits colour, costs no request and
 * scales without a second asset.
 */
export function LeafDecor({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none absolute', flip && 'scale-x-[-1]', className)}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path d="M12 8c26 34 52 62 92 84s70 46 96 78" opacity="0.55" />
        <path d="M40 6c8 26 22 46 44 60" opacity="0.35" />
        <path d="M6 44c26 8 46 22 60 44" opacity="0.35" />
      </g>
      <g fill="currentColor">
        {[
          [46, 30, 20, 11, -32],
          [86, 62, 23, 12, -18],
          [128, 96, 21, 11, -40],
          [166, 130, 24, 12, -22],
          [200, 168, 20, 10, -36],
          [30, 74, 19, 10, 34],
          [70, 108, 21, 11, 40],
          [110, 148, 19, 10, 28],
          [150, 186, 22, 11, 44],
        ].map(([cx, cy, rx, ry, angle], index) => (
          <ellipse
            key={index}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            opacity={0.5}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}
      </g>
      <g fill="currentColor" opacity="0.75">
        {[
          [62, 44, 5],
          [104, 80, 4],
          [146, 116, 5],
          [186, 152, 4],
          [48, 96, 4],
          [92, 132, 5],
        ].map(([cx, cy, r], index) => (
          <circle key={index} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}
