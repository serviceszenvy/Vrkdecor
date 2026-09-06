"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { occasions, services, styles, supportServices, works } from "@/lib/content/site";

/**
 * The top level items match the live site. Two of them open a mega panel:
 * Our Work exposes the portfolio filters, Services exposes the service list.
 */
const PANELS = ["Our Work", "Services"] as const;
type Panel = (typeof PANELS)[number];

const FLAT = [
  { label: "Packages", href: "/packages" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState<Panel | null>(null);
  const [mobile, setMobile] = useState(false);
  const [accordion, setAccordion] = useState<string | null>("Occasions");
  const [feature, setFeature] = useState(0);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const id = setInterval(() => setFeature((f) => (f + 1) % works.length), 3600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const hoverOpen = (panel: Panel) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(panel);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const featured = works[feature];

  return (
    <header className="fixed inset-x-0 top-0 z-50" onMouseLeave={hoverClose}>
      <div className="header-bar">
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-3 lg:gap-6">
          <Link href="/" className="shrink-0" aria-label="VRK Decor, home">
            <Image
              src="/logo.png"
              alt="VRK Decor"
              width={694}
              height={420}
              priority
              className="h-[44px] sm:h-[52px] lg:h-[68px] w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
            <Link href="/" className="nav-link" onMouseEnter={hoverClose}>
              Home
            </Link>
            {PANELS.map((panel) => (
              <div key={panel} className="relative flex items-center">
                <Link
                  href={panel === "Services" ? "/services" : "/our-work"}
                  className="nav-link"
                  aria-expanded={open === panel}
                  onMouseEnter={() => hoverOpen(panel)}
                  onFocus={() => hoverOpen(panel)}
                  data-active={open === panel}
                >
                  {panel}
                  <Icon name="chevron" className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </div>
            ))}
            {FLAT.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" onMouseEnter={hoverClose}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="https://wa.me/919994072435" className="hidden xl:inline-flex btn btn-outline btn-sm">
              <Icon name="whatsapp" className="h-4 w-4" />
              WhatsApp
            </a>
            <Link href="/quote" className="btn btn-primary btn-sm !px-4" data-magnetic="0.22">
              <span className="hidden sm:inline">Get a Quote</span>
              <span className="sm:hidden">Quote</span>
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <button
              className="lg:hidden btn btn-glass btn-sm !px-3"
              onClick={() => setMobile(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ---------------- Mega panel ---------------- */}
        <div
          className={`mega ${open ? "mega-open" : ""}`}
          onMouseEnter={() => open && hoverOpen(open)}
          hidden={!open}
        >
          <div className="shell py-9">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_0.9fr]">
              <div className="mega-col" style={{ ["--i" as string]: 0 }}>
                <p className="eyebrow mb-5">{open === "Services" ? "What we do" : "Browse by occasion"}</p>
                {open === "Services" ? (
                  <ul className="grid sm:grid-cols-2 gap-1.5">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link href="/services" className="mega-item">
                          <span className="mega-icon">
                            <Icon name={s.icon} className="h-4 w-4" />
                          </span>
                          <span>
                            <strong>{s.name}</strong>
                            {s.partner ? <em className="partner-badge">partner vendor</em> : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-1.5">
                    {occasions.map((o) => (
                      <li key={o.slug}>
                        <Link href={`/our-work?occasion=${o.slug}`} className="mega-item">
                          <span className="mega-icon">
                            <Icon name="sparkle" className="h-3.5 w-3.5" />
                          </span>
                          <span>
                            <strong>{o.name}</strong>
                            <small>{o.note}</small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mega-col" style={{ ["--i" as string]: 1 }}>
                <p className="eyebrow mb-5">{open === "Services" ? "Also arranged by us" : "Browse by style"}</p>
                <div className="flex flex-wrap gap-2">
                  {(open === "Services" ? supportServices : styles).map((s) => (
                    <Link key={s} href={open === "Services" ? "/services" : "/our-work"} className="pill">
                      {s}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/quote"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold underline-sweep"
                >
                  Ask for a quotation
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>

              <div className="mega-col" style={{ ["--i" as string]: 2 }}>
                <p className="eyebrow mb-5">Signature work</p>
                <div className="glass glass-raised glass-sheen overflow-hidden">
                  <div className="media aspect-[4/3]">
                    <Image
                      key={featured.slug}
                      src={featured.image}
                      alt={featured.title}
                      fill
                      sizes="360px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)]">
                      {featured.occasion} · {featured.style}
                    </p>
                    <p className="font-display text-lg mt-1.5">{featured.title}</p>
                    <Link href="/our-work" className="btn btn-primary btn-sm mt-4 w-full">
                      View All Work
                      <Icon name="arrow" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Mobile overlay ---------------- */}
      <div className={`mobile-menu ${mobile ? "mobile-open" : ""}`} aria-hidden={!mobile}>
        <div className="flex h-[var(--header-h)] items-center justify-between shell">
          <Image src="/logo-light.png" alt="VRK Decor" width={694} height={420} className="h-[42px] w-auto" />
          <button className="btn btn-glass btn-sm !px-3" onClick={() => setMobile(false)} aria-label="Close menu">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="shell pb-16 overflow-y-auto flex-1">
          <nav className="flex flex-col" aria-label="Mobile">
            {[
              { label: "Home", href: "/" },
              { label: "Our Work", href: "/our-work" },
              { label: "Services", href: "/services" },
              { label: "Packages", href: "/packages" },
              { label: "Gallery", href: "/gallery" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((l, i) => (
              <Link key={l.href} href={l.href} className="mobile-link" style={{ ["--i" as string]: i }}>
                {l.label}
                <Icon name="arrow" className="h-5 w-5 opacity-50" />
              </Link>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            {(["Occasions", "Styles", "Services"] as const).map((menu, i) => (
              <div key={menu} className="glass glass-sheen overflow-hidden" style={{ ["--i" as string]: i + 7 }}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold"
                  onClick={() => setAccordion(accordion === menu ? null : menu)}
                  aria-expanded={accordion === menu}
                >
                  {menu}
                  <Icon
                    name="plus"
                    className={`h-4 w-4 transition-transform duration-500 ${accordion === menu ? "rotate-45" : ""}`}
                  />
                </button>
                {accordion === menu ? (
                  <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {(menu === "Services"
                      ? services.map((s) => s.name)
                      : menu === "Occasions"
                        ? occasions.map((o) => o.name)
                        : styles
                    ).map((label) => (
                      <Link key={label} href={menu === "Services" ? "/services" : "/our-work"} className="pill">
                        {label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3">
            <Link href="/quote" className="btn btn-primary w-full">
              Get a Quote
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <a href="https://wa.me/919994072435" className="btn btn-glass w-full">
              <Icon name="whatsapp" className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
