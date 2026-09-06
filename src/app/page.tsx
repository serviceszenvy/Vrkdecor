import Hero from "@/components/home/Hero";
import StatsStrip from "@/components/home/StatsStrip";
import SignatureWork from "@/components/home/SignatureWork";
import WhyUs from "@/components/home/WhyUs";
import OccasionsRail from "@/components/home/OccasionsRail";
import ServicesOverview from "@/components/home/ServicesOverview";
import HowItWorks from "@/components/home/HowItWorks";
import BrowseByStyle from "@/components/home/BrowseByStyle";
import Testimonials from "@/components/home/Testimonials";
import ServiceAreas from "@/components/home/ServiceAreas";
import CtaQuote from "@/components/home/CtaQuote";
import LeafDivider from "@/components/ui/LeafDivider";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <SignatureWork />
      <LeafDivider />
      <WhyUs />
      <OccasionsRail />
      <ServicesOverview />
      <HowItWorks />
      <BrowseByStyle />
      <LeafDivider flip />
      <Testimonials />
      <ServiceAreas />
      <CtaQuote />
    </>
  );
}
