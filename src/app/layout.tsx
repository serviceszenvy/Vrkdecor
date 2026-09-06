import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MotionRoot from "@/components/motion/MotionRoot";
import { business } from "@/lib/content/site";

const fraunces = localFont({
  src: "../fonts/Fraunces-Variable.woff2",
  variable: "--font-fraunces",
  display: "swap",
  weight: "300 900",
});

const manrope = localFont({
  src: "../fonts/Manrope-Variable.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vrkdecor.com"),
  title: {
    default: "VRK Decor | Premium Event Design in Nagercoil, Tamil Nadu",
    template: "%s | VRK Decor",
  },
  description:
    "Premium event design and complete celebration solutions in Nagercoil, Tamil Nadu. Stage and mandap, florals, entrance, furniture and seating. 14+ years, 600+ events, 35+ team members.",
  keywords: [
    "wedding decoration Nagercoil",
    "mandap decoration Tamil Nadu",
    "reception stage decoration",
    "event decorators Kanyakumari",
    "event management Tirunelveli",
    "valaikappu decoration",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "VRK Decor",
    title: "VRK Decor | Premium Event Design in Nagercoil, Tamil Nadu",
    description:
      "Your celebration, exactly as you pictured it. Weddings, receptions and family celebrations designed and set up across Tamil Nadu.",
    images: [{ url: "/images/hero.svg", width: 1920, height: 1080, alt: "A VRK Decor wedding stage setup" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f8f4",
  width: "device-width",
  initialScale: 1,
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: business.name,
  description:
    "Premium event design and complete celebration solutions in Nagercoil, Tamil Nadu.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "301 M.S Road, Vettunimadam",
    addressLocality: business.city,
    addressRegion: business.state,
    postalCode: "629003",
    addressCountry: "IN",
  },
  telephone: business.phone,
  email: business.email,
  areaServed: ["Nagercoil", "Tirunelveli", "Trivandrum", "Tuticorin", "Madurai", "Tamil Nadu"],
  priceRange: "₹₹",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div
          data-cursor-glow
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-0 hidden lg:block"
          style={{
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,179,66,0.13), rgba(124,179,66,0) 62%)",
            filter: "blur(28px)",
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        <MotionRoot />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
