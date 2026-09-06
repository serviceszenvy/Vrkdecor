import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Icon from "@/components/ui/Icon";
import ContactForm from "@/components/forms/ContactForm";
import { business, serviceAreas } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or email VRK Decor in Nagercoil, or send the form and we will call you back.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us about your celebration"
        lede="Call us, send a message on WhatsApp, or use the form and our team will come back to you."
      />

      <section className="section-tight !pt-0">
        <div className="shell grid gap-6 lg:grid-cols-[1fr_0.85fr] items-start">
          <ContactForm />

          <div className="space-y-4">
            <div className="glass glass-sheen p-7" data-reveal style={{ ["--i" as string]: 1 }}>
              <h2 className="t-3">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <Icon name="pin" className="h-4 w-4 mt-1 shrink-0 text-[var(--color-lime-600)]" />
                  <span>{business.address}</span>
                </li>
                <li className="flex gap-3">
                  <Icon name="phone" className="h-4 w-4 mt-1 shrink-0 text-[var(--color-lime-600)]" />
                  <a href={business.phoneHref} className="underline-sweep">{business.phone}</a>
                </li>
                <li className="flex gap-3">
                  <Icon name="whatsapp" className="h-4 w-4 mt-1 shrink-0 text-[var(--color-lime-600)]" />
                  <a href={business.whatsappHref} className="underline-sweep">{business.whatsapp}</a>
                </li>
                <li className="flex gap-3">
                  <Icon name="mail" className="h-4 w-4 mt-1 shrink-0 text-[var(--color-lime-600)]" />
                  <a href={business.emailHref} className="underline-sweep">{business.email}</a>
                </li>
              </ul>
              <div className="flex gap-2 mt-7">
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

            <div className="glass glass-sheen p-7" data-reveal style={{ ["--i" as string]: 2 }}>
              <h2 className="t-3">Where we work</h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {serviceAreas.map((a) => (
                  <span key={a.name} className="pill">{a.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
