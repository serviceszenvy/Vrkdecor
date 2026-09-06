/**
 * Every piece of copy and data on the site lives here, matched to the live
 * VRK Decor site so the redesign changes the design layer only.
 */

export const business = {
  name: "VRK Decor",
  positioning: "Premium event design and complete celebration solutions",
  yearsActive: "14+",
  eventsDelivered: "600+",
  teamSize: "35+",
  city: "Nagercoil",
  state: "Tamil Nadu",
  address: "301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003",
  phone: "+91 99940 72435",
  phoneHref: "tel:+919994072435",
  whatsapp: "+91 99940 72435",
  whatsappHref: "https://wa.me/919994072435",
  email: "vrk.groups@gmail.com",
  emailHref: "mailto:vrk.groups@gmail.com",
  founder: "V. Raja Kumerasen",
  founderRole: "Founder and CEO",
};

export const hero = {
  eyebrow: "Premium event design",
  headline: ["Your", "celebration,", "exactly", "as", "you", "pictured", "it"],
  highlightFrom: 5,
  lede:
    "We design and set up weddings, receptions and family celebrations across Tamil Nadu, from the stage and mandap to the florals, the entrance and the seating.",
  primaryCta: { label: "Explore Our Work", href: "/our-work" },
  secondaryCta: { label: "Our Services", href: "/services" },
  assurances: ["One team from design to setup", "Trusted partner vendors when you need them"],
};

export const stats = [
  { value: 14, suffix: "+", label: "Years of experience" },
  { value: 600, suffix: "+", label: "Events delivered" },
  { value: 35, suffix: "+", label: "Team members" },
  { value: 5, suffix: "", label: "Primary coverage areas" },
];

export const occasions = [
  { name: "Wedding", slug: "wedding", note: "Mandap, stage, entrance and hall" },
  { name: "Reception", slug: "reception", note: "Stage-led evening design" },
  { name: "Engagement / Nichayathartham", slug: "engagement", note: "Intimate and floral-forward" },
  { name: "Seer Varisai Ceremony", slug: "seer-varisai", note: "Tray styling and display" },
  { name: "Puberty Ceremony / Manjal Neerattu Vizha", slug: "puberty-ceremony", note: "Traditional family setting" },
  { name: "Ear-Piercing / Kaadhu Kuthu", slug: "ear-piercing", note: "Warm decor at a smaller scale" },
  { name: "Baby Shower / Valaikappu", slug: "baby-shower", note: "Soft palettes and floral corners" },
  { name: "Birthday", slug: "birthday", note: "Themed backdrops and cake stage" },
  { name: "Housewarming / Gruhapravesam", slug: "housewarming", note: "Entrance and pooja area" },
  { name: "Corporate Events", slug: "corporate", note: "Stage, branding and seating" },
];

export const styles = [
  "Traditional",
  "Royal",
  "Floral",
  "Modern",
  "Minimal",
  "Luxury",
  "Pastel",
  "Heritage / Temple",
  "Colourful",
  "Contemporary",
];

export const services = [
  {
    name: "Event & Wedding Decoration",
    slug: "event-wedding-decoration",
    icon: "sparkle",
    blurb:
      "The full setting for your day, planned as one look from the entrance through to the stage.",
    partner: false,
    includes: ["Concept and colour direction", "Venue and hall dressing", "Setup and same-day removal"],
  },
  {
    name: "Stage & Mandap Decoration",
    slug: "stage-mandap-decoration",
    icon: "arch",
    blurb: "The centrepiece of the celebration, built to the scale of your venue and framed for photographs.",
    partner: false,
    includes: ["Custom backdrop build", "Mandap pillars and canopy", "Seating and pedestal styling"],
  },
  {
    name: "Floral Decoration",
    slug: "floral-decoration",
    icon: "flower",
    blurb: "Fresh and artificial florals, sourced on the morning of the event wherever it matters.",
    partner: false,
    includes: ["Garlands and jaimala", "Table and aisle florals", "Car and entrance florals"],
  },
  {
    name: "Entrance Decoration",
    slug: "entrance-decoration",
    icon: "gate",
    blurb: "The first thing your guests see, treated as a design moment of its own.",
    partner: false,
    includes: ["Arch and gate builds", "Walkway and carpet", "Welcome signage"],
  },
  {
    name: "Makeup & Styling",
    slug: "makeup-styling",
    icon: "brush",
    blurb: "Bridal and family makeup arranged with artists we have worked alongside for years.",
    partner: true,
    includes: ["Bridal makeup", "Family and guest styling", "Draping and hair"],
  },
  {
    name: "Sounds & Lightings",
    slug: "sounds-lightings",
    icon: "bolt",
    blurb: "Stage wash, ambient lighting and audio, matched to the decoration plan.",
    partner: true,
    includes: ["Stage and hall lighting", "Audio and microphones", "Effects and cold pyro"],
  },
];

export const supportServices = [
  "Complete Event Management",
  "Furniture & Seating",
  "LED / Display Solutions",
  "Return Gifts & Essentials",
];

export const whyUs = [
  {
    title: "Designed around your day",
    body: "Every setup is planned for your occasion, your venue and the look you have in mind.",
    icon: "compass",
  },
  {
    title: "One team, start to finish",
    body: "Thirty five people covering design, stage and mandap, florals, entrance, furniture and seating.",
    icon: "team",
  },
  {
    title: "Fourteen years of practice",
    body: "More than 600 celebrations set up for families and companies across Tamil Nadu.",
    icon: "clock",
  },
  {
    title: "Specialists when you need them",
    body: "Makeup, sound and lighting, photography and catering are arranged with trusted partner vendors.",
    icon: "link",
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Find a look you like",
    body: "Browse our work by occasion, style or service until you find a setting that feels right for your day.",
  },
  {
    step: "02",
    title: "Ask for a quote",
    body: "Send us the design you like along with your date and venue. The design stays attached to your request, so there is nothing to describe twice.",
  },
  {
    step: "03",
    title: "We call you back",
    body: "You get a confirmation straight away, and our team follows up on the phone or on WhatsApp to talk through what you need.",
  },
  {
    step: "04",
    title: "We set up your day",
    body: "Stage and mandap, florals, entrance, furniture and full event management, all looked after by one team.",
  },
];

export const serviceAreas = [
  { name: "Nagercoil", note: "Head office" },
  { name: "Tirunelveli", note: "Regular" },
  { name: "Trivandrum", note: "Regular" },
  { name: "Tuticorin", note: "Regular" },
  { name: "Madurai", note: "Regular" },
  { name: "Across Tamil Nadu", note: "On request" },
];

export type Work = {
  slug: string;
  title: string;
  occasion: string;
  style: string;
  place: string;
  image: string;
  blurb: string;
  featured?: boolean;
};

export const works: Work[] = [
  {
    slug: "golden-mandap-setting",
    title: "Golden Mandap Setting",
    occasion: "Wedding",
    style: "Traditional",
    place: "Nagercoil",
    image: "/images/work-wedding.svg",
    blurb: "A temple-toned mandap in gold and deep green, built to the proportions of the hall.",
    featured: true,
  },
  {
    slug: "garden-reception-stage",
    title: "Garden Reception Stage",
    occasion: "Reception",
    style: "Modern",
    place: "Tirunelveli",
    image: "/images/work-reception.svg",
    blurb: "An open garden stage with layered drapes and a warm wash for evening photography.",
    featured: true,
  },
  {
    slug: "valaikappu-floral-corner",
    title: "Valaikappu Floral Corner",
    occasion: "Baby Shower",
    style: "Floral",
    place: "Nagercoil",
    image: "/images/work-babyshower.svg",
    blurb: "A soft floral corner and seating for a family-only afternoon at home.",
    featured: true,
  },
  {
    slug: "birthday-celebration-setup",
    title: "Birthday Celebration Setup",
    occasion: "Birthday",
    style: "Colourful",
    place: "Tuticorin",
    image: "/images/work-birthday.svg",
    blurb: "A bright themed backdrop with balloon work and a low cake stage for the photographs.",
    featured: true,
  },
  {
    slug: "pastel-engagement-backdrop",
    title: "Pastel Engagement Backdrop",
    occasion: "Engagement",
    style: "Pastel",
    place: "Trivandrum",
    image: "/images/work-engagement.svg",
    blurb: "One arch, two tones and a great deal of restraint for an evening ceremony.",
  },
  {
    slug: "temple-style-gruhapravesam",
    title: "Temple-Style Gruhapravesam",
    occasion: "Housewarming",
    style: "Heritage / Temple",
    place: "Madurai",
    image: "/images/work-seer.svg",
    blurb: "Brass, banana leaf and traditional line work for the entrance and the pooja area.",
  },
];

export const workServiceFilters = [
  "Complete Event Management",
  "Entrance Decoration",
  "Event & Wedding Decoration",
  "Floral Decoration",
  "Furniture & Seating",
  "LED / Display Solutions",
  "Return Gifts & Essentials",
  "Stage & Mandap Decoration",
];

export const packagesIntro = {
  status: "Packages are being finalised",
  body: "We are finalising the packages we publish here. In the meantime every celebration is quoted on its own, because the venue, the guest count and the look all change what a setup takes.",
  callout: "Tell us your date, your venue and what you have in mind, and we will prepare a quotation for you.",
};

export const quotationCovers = [
  {
    title: "Design and direction",
    body: "The concept for your occasion, the colour direction and a plan drawn around your venue.",
    icon: "compass",
  },
  {
    title: "Build and materials",
    body: "Stage and mandap, entrance, florals, furniture and seating, itemised so you can see what drives the cost.",
    icon: "arch",
  },
  {
    title: "Setup and coordination",
    body: "Delivery, on-site setup, one team through the day and removal once the celebration is over.",
    icon: "team",
  },
  {
    title: "Partner services",
    body: "Makeup, sound and lighting, photography and catering, quoted separately and clearly marked.",
    icon: "link",
  },
];

export const galleryImages = [
  { src: "/images/gal-1.svg", alt: "Golden mandap setting lit for a wedding ceremony", tall: true, occasion: "Wedding" },
  { src: "/images/gal-2.svg", alt: "Garden reception stage with layered drapes", tall: false, occasion: "Reception" },
  { src: "/images/gal-3.svg", alt: "Valaikappu floral corner with seating", tall: false, occasion: "Baby Shower" },
  { src: "/images/gal-4.svg", alt: "Floral entrance arch at dusk", tall: true, occasion: "Wedding" },
  { src: "/images/gal-5.svg", alt: "Birthday backdrop with balloon work", tall: false, occasion: "Birthday" },
  { src: "/images/gal-6.svg", alt: "Brass and banana leaf display for a gruhapravesam", tall: false, occasion: "Housewarming" },
  { src: "/images/gal-7.svg", alt: "Pastel engagement backdrop in two tones", tall: true, occasion: "Engagement" },
  { src: "/images/gal-8.svg", alt: "Hall dressing with hanging florals", tall: false, occasion: "Wedding" },
  { src: "/images/gal-9.svg", alt: "Pathway lighting and carpet at an evening reception", tall: false, occasion: "Reception" },
];

export const nav = [
  { label: "Home", href: "/" },
  { label: "Our Work", href: "/our-work" },
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const sections = {
  glance: {
    eyebrow: "VRK Decor at a glance",
    title: "Fourteen years of celebrations, set up by one team",
  },
  work: {
    eyebrow: "Our Signature Work",
    title: "Four celebrations we have set up recently",
    lede: "From a wedding mandap to a birthday evening.",
    cta: "View All Work",
  },
  why: {
    eyebrow: "Why choose VRK Decor",
    title: "Four reasons families keep coming back",
  },
  occasions: {
    eyebrow: "Perfect for every occasion",
    title: "Weddings and receptions through to family ceremonies, birthdays and corporate events",
    cta: "See every occasion we decorate",
  },
  services: {
    eyebrow: "Complete celebration solutions",
    title: "Everything the day needs, coordinated by one team",
    lede: "VRK Decor is the main event design and coordination brand. Specialist services are delivered with trusted partner vendors.",
    cta: "See all services",
  },
  process: {
    eyebrow: "From first look to your celebration",
    title: "Four steps, and only the first one is yours",
  },
  stylesSection: {
    eyebrow: "Find the look you have in mind",
    title: "Start from a style, not a checklist",
    lede: "Traditional, royal, floral, minimal or contemporary. Filter the portfolio by the style you want and see what it looks like in a real venue.",
  },
  testimonials: {
    eyebrow: "What our customers say",
    title: "Reviews from recent celebrations",
    lede: "Reviews from recent celebrations will appear here once they have been checked and approved.",
  },
  areas: {
    eyebrow: "Serving across Tamil Nadu",
    title: "Based in Nagercoil, on site across the south",
    lede: "We work across Nagercoil, Tirunelveli, Trivandrum, Tuticorin, Madurai and anywhere in Tamil Nadu depending on what your event needs. Tell us where the celebration is and we will plan the setup around the venue.",
  },
  cta: {
    eyebrow: "Ready when you are",
    title: "Have a celebration coming up?",
    lede: "Share your date, your venue and the look you are after. We will come back to you on the phone or on WhatsApp and put a quotation together.",
  },
};
