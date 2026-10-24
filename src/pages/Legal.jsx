import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { EMAIL, PHONE_TEL, PHONE_DISPLAY, ANALYTICS, ANALYTICS_ON, LAST_UPDATED, LAST_UPDATED_LABEL, waLink } from '../site.js'

/* ================= LEGAL ================= */
export function Privacy() {
  return (
    <main id="main">
      <PageHero crumb="Privacy Policy" title="Privacy Policy" lead="How this website handles the details you share with us" />
      <section className="section pt-0">
        <div className="wrap"><div className="prose">
          <p>VRK Decor (301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003) respects your privacy. This website is a brochure site for our event decoration business. It stores no form submissions on any server.</p>
          <h2>Information you share with us</h2>
          <p>The quote and contact forms on this site compose a WhatsApp message on your own device. The name, phone number, event details and requirements you type are sent to us only when you choose to send that message in WhatsApp. If you call, email or message us directly, those conversations are handled under the terms of your phone, email or WhatsApp provider.</p>
          <h2>Analytics and cookies</h2>
          {ANALYTICS_ON ? (
            <p>With your permission, this site uses {[ANALYTICS.GA4_ID && 'Google Analytics', ANALYTICS.META_PIXEL_ID && 'the Meta Pixel'].filter(Boolean).join(' and ')} to count visits and see which pages and buttons are used, for example how many people tap WhatsApp or call. These tools load only after you tap Accept on the notice shown on your first visit. If you tap No thanks, they do not load. You can change your choice at any time by clearing this site&rsquo;s data in your browser. We do this in line with India&rsquo;s Digital Personal Data Protection Act, 2023.</p>
          ) : (
            <p>This site does not run analytics trackers or set marketing cookies. If we add visitor statistics in future, they will load only after you give permission through a notice on the site, and this policy will be updated first.</p>
          )}
          <p>The map on our contact page loads from Google only when you tap Show the map.</p>
          <h2>How we use your details</h2>
          <p>We use the details you share only to respond to your enquiry, prepare quotations, plan and deliver the decoration services you book, and coordinate partner services such as band set or sound where you request them. We do not sell your information, and we do not share it with anyone except the partner vendors needed to deliver your event.</p>
          <h2>Event photographs</h2>
          <p>We photograph our decoration work for our records. If we wish to feature photographs from your event on our website, Instagram or other promotion, we will seek your permission first. You may ask us at any time to remove a photograph connected to your event by contacting the details below.</p>
          <h2>Links to other services</h2>
          <p>This site links to WhatsApp, Instagram, Facebook, Google Maps, Justdial and IndiaMART. Those platforms operate under their own privacy policies once you leave our site.</p>
          <h2>Your choices</h2>
          <p>You may contact us at any time to ask what details of yours we hold from past enquiries or bookings, to correct them, or to ask us to delete them where we have no ongoing need to keep them.</p>
          <h2>Contact</h2>
          <p>For any privacy question, write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>.</p>
          <p className="last-updated">Last updated: <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL.en}</time></p>
        </div></div>
      </section>
    </main>
  )
}

export function Terms() {
  return (
    <main id="main">
      <PageHero crumb="Terms" title="Terms of Use" lead="The terms that apply to this website and to bookings made with VRK Decor" />
      <section className="section pt-0">
        <div className="wrap"><div className="prose">
          <h2>About this website</h2>
          <p>This website presents the services and past work of VRK Decor, an event decoration business based in Nagercoil, Tamil Nadu. Using the site or sending an enquiry does not by itself create a booking.</p>
          <h2>Quotations</h2>
          <p>Designs shown in Our Work illustrate VRK Decor&rsquo;s styles and capabilities. Final designs depend on your venue, season, flower availability and budget, and are confirmed in a written quotation for your specific date. A quotation is valid for the period stated on it.</p>
          <h2>Bookings and payment</h2>
          <p>A booking is confirmed only on payment of the advance stated in your quotation. The balance is payable as agreed in the quotation. Changes to the venue, date, scope or design after confirmation may revise the quoted amount.</p>
          <h2>Cancellation and postponement</h2>
          <p>If you need to cancel or postpone, inform us as early as possible. Amounts already spent on flowers, materials and advances to partner vendors for your event may not be refundable. Postponement to a new date is accommodated subject to availability.</p>
          <h2>Partner services</h2>
          <p>Band set, live band, sound and AV are provided by partner vendors arranged and coordinated by VRK Decor. These services are delivered by the partner under their own terms, with VRK Decor as your single point of coordination.</p>
          <h2>Venue conditions</h2>
          <p>Decoration plans depend on the venue permitting the agreed setup, access times and electrical supply. Restrictions imposed by a venue on the day may require reasonable adjustments to the design.</p>
          <h2>Website content</h2>
          <p>Photographs, text and the VRK Decor name and logo on this site belong to VRK Decor and may not be copied or reused without written permission.</p>
          <h2>Jurisdiction</h2>
          <p>These terms are governed by the laws of India, and any dispute is subject to the courts at Nagercoil, Tamil Nadu.</p>
          <h2>Contact</h2>
          <p>Questions about these terms can be sent to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>.</p>
        </div></div>
      </section>
    </main>
  )
}

/* ================= 404 (bilingual, one file serves every missing URL) ================= */
export function NotFound() {
  const t = useT()
  return (
    <main id="main">
      <PageHero crumb="404" title={<>Page not found <span className="nf-ta" lang="ta">பக்கம் கிடைக்கவில்லை</span></>}
        lead="The page you were looking for has moved or does not exist. Try one of these links, or message us on WhatsApp." />
      <section className="section pt-0">
        <div className="wrap">
          <p lang="ta" className="nf-ta-p">நீங்கள் தேடிய பக்கம் நகர்த்தப்பட்டது அல்லது இல்லை. கீழே உள்ள இணைப்புகளைப் பயன்படுத்துங்கள், அல்லது WhatsApp-ல் எங்களிடம் கேளுங்கள்.</p>
          <div className="btn-row btn-row-left">
            <Link className="btn btn-primary" to="/">{t.backHome}</Link>
            <Link className="btn btn-ghost" to="/services">Services</Link>
            <a className="btn btn-wa" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer">{I.wa} WhatsApp</a>
            <Link className="btn btn-ghost" to="/ta" lang="ta">தமிழ் முகப்பு</Link>
            <Link className="btn btn-ghost" to="/ta/services" lang="ta">சேவைகள்</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
