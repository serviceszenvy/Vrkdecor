import type { Metadata } from 'next';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  GlassPanel,
  ImageFrame,
  ImageScrim,
  Section,
  SectionHeading,
} from '@/components/ui';
import {
  contrastContract,
  glass,
  logoColors,
  minTouchTargetPx,
  palette,
  radii,
  semanticColors,
} from '@/lib/design-tokens';
import { routes } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Proposed design system',
  description:
    'AI-derived proposed digital design system for VRK Decor, pending client review.',
  // Internal reference page: never indexed.
  robots: { index: false, follow: false, nocache: true },
};

const typeSamples = [
  { name: 'Display / 5xl', className: 'font-display text-5xl' },
  { name: 'Display / 4xl', className: 'font-display text-4xl' },
  { name: 'Display / 3xl', className: 'font-display text-3xl' },
  { name: 'Display / 2xl', className: 'font-display text-2xl' },
  { name: 'Body / lg', className: 'text-lg' },
  { name: 'Body / base', className: 'text-base' },
  { name: 'Body / sm', className: 'text-sm' },
  { name: 'Caption / xs', className: 'text-xs' },
] as const;

function Swatches({ name, scale }: { name: string; scale: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-xl font-medium capitalize">{name}</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {Object.entries(scale).map(([step, hex]) => (
          <li key={step} className="border-line overflow-hidden rounded-md border">
            <div className="h-14 w-full" style={{ backgroundColor: hex }} />
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium">
                {name}-{step}
              </p>
              <p className="text-ink-muted text-2xs font-mono uppercase">{hex}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Section spacing="default" tone="panel" width="wide" className="pt-24">
        <SectionHeading
          level={1}
          eyebrow="Internal reference"
          title="Proposed digital design system"
          lead="Derived by analysing the supplied VRK Decor logo. Pending client review."
        />
        <div className="border-brand-300 bg-brand-50 mt-6 max-w-3xl rounded-2xl border p-5">
          <p className="text-brand-900 text-sm">
            <strong>This is not an official VRK Decor brand guideline.</strong> No
            official brand guide was supplied, so this system was derived by measuring
            the colours in the logo artwork and proposing a typographic, spacing and
            component system around them. It is a proposal for review and approval, and
            must be superseded if an official brand guideline is later provided.
          </p>
        </div>
      </Section>

      <Section spacing="default" tone="panel" width="wide" aria-labelledby="colour">
        <SectionHeading
          id="colour"
          eyebrow="Foundations"
          title="Colour"
          lead={`Measured from the logo: lime ${logoColors.lime} in the "VRK" wordmark and sage ${logoColors.sage} in the "DECOR" wordmark, leaf and ellipse.`}
        />
        <div className="mt-8 flex flex-col gap-8">
          <Swatches name="brand" scale={palette.brand} />
          <Swatches name="accent" scale={palette.accent} />
          <Swatches name="sand" scale={palette.sand} />
        </div>
      </Section>

      <Section spacing="default" tone="panel" width="wide" aria-labelledby="contrast">
        <SectionHeading
          id="contrast"
          eyebrow="Accessibility"
          title="Contrast contract"
          lead="Every pairing below is asserted by an automated test. A change that breaks one fails the build."
        />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-xl border-collapse text-left text-sm">
            <thead>
              <tr className="border-line border-b">
                <th className="py-2 pr-4 font-medium">Pairing</th>
                <th className="py-2 pr-4 font-medium">Sample</th>
                <th className="py-2 font-medium">Required</th>
              </tr>
            </thead>
            <tbody>
              {contrastContract.map((pair) => (
                <tr key={pair.name} className="border-line border-b">
                  <td className="py-2 pr-4">{pair.name}</td>
                  <td className="py-2 pr-4">
                    <span
                      className="inline-block rounded-sm px-3 py-1"
                      style={{ color: pair.fg, backgroundColor: pair.bg }}
                    >
                      Aa sample
                    </span>
                  </td>
                  <td className="text-ink-muted py-2">{pair.min}:1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section spacing="default" tone="panel" width="wide" aria-labelledby="glass">
        <SectionHeading
          id="glass"
          eyebrow="Foundations"
          title="Glass surfaces"
          lead="Translucency is used to let photography stay visible through the interface, not as a finish on every box. Each surface falls back to a near-opaque panel where backdrop-filter is unsupported."
        />
        <div className="from-brand-700 to-brand-900 mt-8 grid gap-4 rounded-3xl bg-gradient-to-br p-6 sm:grid-cols-2 lg:grid-cols-4">
          <GlassPanel tone="default" radius="2xl" className="p-5">
            <p className="text-ink font-semibold">Default</p>
            <p className="text-ink-soft text-sm">
              Floating panels over photography and the page ground.
            </p>
          </GlassPanel>
          <GlassPanel tone="strong" radius="2xl" className="p-5">
            <p className="text-ink font-semibold">Strong</p>
            <p className="text-ink-soft text-sm">
              The header, the statistics bar and anything carrying dense text.
            </p>
          </GlassPanel>
          <GlassPanel tone="tint" radius="2xl" className="p-5">
            <p className="text-ink font-semibold">Tint</p>
            <p className="text-ink-soft text-sm">
              Green-tinted glass for brand moments such as the closing action.
            </p>
          </GlassPanel>
          <GlassPanel tone="vivid" radius="2xl" className="p-5">
            <p className="text-ink font-semibold">Vivid</p>
            <p className="text-ink-soft text-sm">
              Warmer highlight glass for a small number of featured moments.
            </p>
          </GlassPanel>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(glass).map(([name, value]) => (
            <div
              key={name}
              className="border-line-soft bg-canvas flex flex-col rounded-xl border p-3"
            >
              <dt className="text-xs font-medium">{name}</dt>
              <dd className="text-ink-muted text-2xs font-mono break-all">{value}</dd>
            </div>
          ))}
        </dl>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(radii).map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className="border-brand-300 bg-brand-50 h-16 w-full border"
                style={{ borderRadius: value === '9999px' ? '9999px' : value }}
              />
              <p className="text-2xs text-ink-muted font-mono">
                {name} {value}
              </p>
            </div>
          ))}
        </dl>
      </Section>

      <Section spacing="default" tone="panel" width="wide" aria-labelledby="type">
        <SectionHeading
          id="type"
          eyebrow="Foundations"
          title="Typography"
          lead="A serif display face for headings, echoing the serif DECOR wordmark, paired with a neutral sans for interface and body copy. Sizes are fluid."
        />
        <div className="mt-8 flex flex-col gap-5">
          {typeSamples.map((sample) => (
            <div key={sample.name} className="border-line border-b pb-4">
              <p className="text-ink-muted text-2xs mb-1 tracking-widest uppercase">
                {sample.name}
              </p>
              <p className={sample.className}>Wedding stage &amp; mandap decoration</p>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="default" tone="panel" width="wide" aria-labelledby="buttons">
        <SectionHeading
          id="buttons"
          eyebrow="Components"
          title="Buttons and calls to action"
          lead={`Seven variants, three sizes. Every control is at least ${minTouchTargetPx}px in both dimensions and every label meets WCAG AA against its background.`}
        />
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Get a Quote</Button>
            <Button variant="accent">Get a Quote</Button>
            <Button variant="secondary">Explore Our Work</Button>
            <Button variant="outline">View Design</Button>
            <Button variant="ghost">Filter</Button>
            <Button variant="glass">Our Services</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="bg-surface-inverse flex flex-wrap items-center gap-3 rounded-2xl p-5">
            <Button variant="inverse">On dark surface</Button>
            <Button variant="accent">Get a Quote</Button>
          </div>
        </div>
      </Section>

      <Section spacing="default" tone="panel" width="wide" aria-labelledby="cards">
        <SectionHeading
          id="cards"
          eyebrow="Components"
          title="Cards, tags and imagery"
          lead="The portfolio card is photography-first: a fixed aspect ratio prevents layout shift, and the scrim keeps overlaid text legible on any image."
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card interactive as="article" className="group">
            <ImageFrame ratio="landscape" radius="none" zoomOnHover>
              <div className="from-brand-200 to-accent-200 h-full w-full bg-gradient-to-br" />
            </ImageFrame>
            <CardBody>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="brand">Wedding</Badge>
                <Badge tone="neutral">Floral</Badge>
              </div>
              <CardTitle>Design card</CardTitle>
              <CardMeta>Nagercoil &middot; Stage &amp; Mandap</CardMeta>
            </CardBody>
          </Card>

          <Card interactive as="article" className="group relative">
            <ImageFrame ratio="landscape" radius="none" zoomOnHover>
              <div className="from-brand-700 to-brand-900 h-full w-full bg-gradient-to-br" />
              <ImageScrim />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-medium text-white">Overlay caption</p>
                <p className="text-2xs text-white/80">Scrim keeps text legible</p>
              </div>
            </ImageFrame>
            <CardBody>
              <CardTitle>Overlay treatment</CardTitle>
              <CardMeta>For hero and featured tiles</CardMeta>
            </CardBody>
          </Card>

          <Card as="article">
            <CardBody>
              <CardTitle>Content card</CardTitle>
              <CardMeta>
                Used for services, packages and testimonials where photography is not
                the subject.
              </CardMeta>
              <div className="mt-2">
                <ButtonLink href={routes.services} variant="outline" size="sm">
                  Learn more
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Badge tone="brand">Traditional</Badge>
          <Badge tone="brand">Royal</Badge>
          <Badge tone="accent">Featured</Badge>
          <Badge tone="neutral">Pastel</Badge>
          <Badge tone="neutral">Heritage / Temple</Badge>
        </div>
      </Section>

      <Section spacing="default" tone="inverse" width="wide" aria-labelledby="inverse">
        <SectionHeading
          id="inverse"
          tone="inverse"
          eyebrow="Surfaces"
          title="Inverse band"
          lead="A dark band used for the footer and full-bleed feature sections, giving photography room to breathe between light sections."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={routes.quote} variant="accent" size="md">
            Get a Quote
          </ButtonLink>
          <ButtonLink href={routes.work} variant="inverse" size="md">
            Explore Our Work
          </ButtonLink>
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Surface', semanticColors.surface],
            ['Subtle', semanticColors.surfaceSubtle],
            ['Inverse', semanticColors.surfaceInverse],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/20 p-4">
              <dt className="text-sand-200 text-sm">{label}</dt>
              <dd className="text-2xs font-mono text-white uppercase">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
