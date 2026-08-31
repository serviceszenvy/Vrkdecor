import Image from 'next/image';
import Link from 'next/link';
import {
  Badge,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  ImageFrame,
} from '@/components/ui';
import { designHref } from '../quote-link';
import { coverImage, type PortfolioDesign } from '../types';

/**
 * Portfolio card for a Design.
 *
 * The whole card links to the parent Design's detail page. Related images are
 * never separate cards — they live inside the Design (Requirements section 9).
 */
export function DesignCard({
  design,
  priority = false,
}: {
  design: PortfolioDesign;
  priority?: boolean;
}) {
  const cover = coverImage(design);

  return (
    /*
      `relative` is required. The card title uses a stretched link
      (`after:inset-0`) to make the whole card clickable; without a positioned
      ancestor that pseudo-element expands to the nearest one and silently
      covers unrelated page content, swallowing clicks on the filters.
    */
    <Card as="li" interactive className="group relative">
      <ImageFrame ratio="landscape" rounded={false} zoomOnHover>
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="from-brand-100 to-accent-100 h-full w-full bg-gradient-to-br" />
        )}
      </ImageFrame>

      <CardBody>
        <div className="flex flex-wrap gap-1.5">
          {design.occasion ? <Badge tone="brand">{design.occasion.name}</Badge> : null}
          {design.featured ? <Badge tone="accent">Featured</Badge> : null}
        </div>

        <CardTitle>
          <Link
            href={designHref(design.slug)}
            className="after:absolute after:inset-0 hover:underline"
          >
            {design.name}
          </Link>
        </CardTitle>

        <CardMeta>
          {[design.location, design.styles.map((style) => style.name).join(', ')]
            .filter(Boolean)
            .join(' · ')}
        </CardMeta>
      </CardBody>
    </Card>
  );
}
