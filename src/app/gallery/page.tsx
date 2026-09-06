import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";
import CtaQuote from "@/components/home/CtaQuote";
import { galleryImages } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from VRK Decor setups across Nagercoil, Tirunelveli, Trivandrum and beyond.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Rooms, mid-celebration"
        lede="Tap any image for the full frame. Everything here was built by our own team."
      />

      <section className="section-tight !pt-0">
        <div className="shell">
          <div className="masonry">
            {galleryImages.map((img, i) => (
              <figure key={img.src} className="glass glass-sheen overflow-hidden lift" data-reveal style={{ ["--i" as string]: i % 3 }}>
                <div className={`media relative ${img.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  <Image src={img.src} alt={img.alt} fill sizes="(max-width:1024px) 92vw, 33vw" loading="lazy" className="object-cover" />
                  <span className="tag-chip">{img.occasion}</span>
                </div>
                <figcaption className="px-5 py-4 text-sm text-[var(--ink-3)]">{img.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CtaQuote />
    </>
  );
}
