import type { Metadata } from 'next';
import { CtaBand, EmptyState, Hero } from '@/components/page';
import {
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  ImageFrame,
  Section,
} from '@/components/ui';
import { styles } from '@/lib/content';
import { getPublishedDesigns } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Our Work — Decoration Portfolio',
  description:
    'Browse VRK Decor’s portfolio of weddings, receptions and celebrations across Tamil Nadu, and request a quote for the design you like.',
  path: '/our-work',
});

/**
 * Our Work — the portfolio listing route.
 *
 * P4 delivers the route, its metadata and a listing of published designs. The
 * portfolio experience itself — occasion/style/service filters, design detail
 * pages, the ordered gallery, lightbox and photo-level quote CTAs — is P5
 * (`05_PROMPTS/05-PORTFOLIO.md`) and replaces the body of this page.
 *
 * Only published designs are ever returned; that is enforced by Row Level
 * Security, not by this page.
 */
export default async function OurWorkPage() {
  const designs = await getPublishedDesigns();

  return (
    <>
      <Hero
        compact
        eyebrow="Our work"
        title="Celebrations we have designed"
        lead="Every design can start a quote request — you never have to describe it twice."
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section width="wide" aria-labelledby="designs">
        <h2 id="designs" className="sr-only">
          Designs
        </h2>

        <ul className="mb-8 flex flex-wrap gap-2">
          {styles.map((style) => (
            <li key={style.slug}>
              <Badge tone="neutral">{style.name}</Badge>
            </li>
          ))}
        </ul>

        {designs.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <Card key={design.id} as="li" interactive className="group">
                <ImageFrame ratio="landscape" rounded={false} zoomOnHover>
                  <div className="from-brand-100 to-accent-100 h-full w-full bg-gradient-to-br" />
                </ImageFrame>
                <CardBody>
                  <CardTitle>{design.name}</CardTitle>
                  {design.location ? <CardMeta>{design.location}</CardMeta> : null}
                </CardBody>
              </Card>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="The portfolio is being prepared"
            body="VRK Decor is adding its designs and photographs. Tell us about your celebration and the team will share relevant work with you directly."
            action={
              <ButtonLink href={routes.quote} variant="primary" size="md">
                Get a Quote
              </ButtonLink>
            }
          />
        )}
      </Section>

      <CtaBand />
    </>
  );
}
