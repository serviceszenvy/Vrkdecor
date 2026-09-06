import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <section className="page-hero section">
      <div className="aura aura-lime" style={{ width: 620, height: 620, left: "-14%", top: "-30%", opacity: 0.4 }} />
      <div className="shell-narrow relative z-10 text-center">
        <span className="eyebrow justify-center">404</span>
        <h1 className="t-1 mt-5">That page is not set up</h1>
        <p className="lede mt-4 mx-auto">The link may be old. Everything we have built is on the work page.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/" className="btn btn-primary">
            Back home
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <Link href="/our-work" className="btn btn-glass">See our work</Link>
        </div>
      </div>
    </section>
  );
}
