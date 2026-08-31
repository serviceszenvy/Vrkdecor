import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';
import logoSrc from '@/public/brand/vrk-decor-logo.png';

/**
 * The supplied VRK Decor logo, background-keyed to transparency so it sits on
 * both light and dark surfaces. The artwork itself is unmodified brand
 * property; the design system does not redraw or restyle it.
 */
export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={routes.home}
      className={cn('inline-flex items-center', className)}
      aria-label={`${siteConfig.name} — home`}
    >
      <Image
        src={logoSrc}
        alt={siteConfig.name}
        priority={priority}
        sizes="(min-width: 1024px) 200px, 150px"
        className="h-10 w-auto sm:h-12"
      />
    </Link>
  );
}
