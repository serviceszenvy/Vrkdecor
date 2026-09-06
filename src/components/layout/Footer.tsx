import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { business, nav, serviceAreas, services } from "@/lib/content/site";

export default function Footer() {
  return (
    <footer className="band-dark grain relative overflow-hidden">
      <div className="aura aura-lime" style={{ width: 620, height: 620, left: "-14%", bottom: "-38%", opacity: 0.35 }} />
      <div className="aura aura-warm" style={{ width: 480, height: 480, right: "-10%", top: "-30%", opacity: 0.22 }} />

      <div className="shell relative z-10 pt-20 pb-10">
        <div className="glass glass-sheen p-8 md:p-12 grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]" data-reveal>
          <div>
            <Image src="/logo-light.png" alt="VRK Decor" width={694} height={420} className="h-[62px] w-auto" />
            <p className="lede mt-5 text-[0.95rem]">
              {business.positioning}. We design and set up weddings, receptions and family celebrations across Tamil
              Nadu, from the stage and mandap to the florals, the entrance and the seating.
            </p>
            <div className="flex gap-2 mt-6">
              <a href={business.whatsappHref} className="btn btn-primary btn-sm">
                <Icon name="whatsapp" className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={business.phoneHref} className="btn btn-glass btn-sm">
                <Icon name="phone" className="h-4 w-4" />
                Call
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5">Explore</p>
            <ul className="space-y-2.5 text-sm">
              {nav.slice(1).concat([{ label: "Get a Quote", href: "/quote" }]).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-sweep text-[var(--ink-2)] hover:text-[var(--ink)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">Services</p>
            <ul className="space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href="/services" className="underline-sweep text-[var(--ink-2)] hover:text-[var(--ink)]">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">Reach us</p>
            <ul className="space-y-3.5 text-sm text-[var(--ink-2)]">
              <li className="flex gap-3">
                <Icon name="pin" className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-lime-300)]" />
                <span>{business.address}</span>
              </li>
              <li className="flex gap-3">
                <Icon name="phone" className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-lime-300)]" />
                <a href={business.phoneHref} className="underline-sweep">{business.phone}</a>
              </li>
              <li className="flex gap-3">
                <Icon name="mail" className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-lime-300)]" />
                <a href={business.emailHref} className="underline-sweep">{business.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" data-reveal>
          {serviceAreas.map((a) => (
            <span key={a.name} className="pill !text-xs !py-1.5 !px-3">{a.name}</span>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-[var(--ink-3)]">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="underline-sweep">Privacy Policy</Link>
            <Link href="/terms" className="underline-sweep">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
