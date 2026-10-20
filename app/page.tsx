import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Boxes, Cog, Factory, MoveUpRight, ScanLine } from "lucide-react";
import { FanIllustration } from "@/components/fan-illustration";
import { ProductCard } from "@/components/product-card";
import { getPublicProducts } from "@/lib/public-products";

export const dynamic = "force-dynamic";

const capabilities = [
  { icon: <Cog />, title: "Engineering-led", text: "Discuss the fit, function, and technical requirements of your application with our team." },
  { icon: <BadgeCheck />, title: "Quality minded", text: "A manufacturing-focused approach, with inspection requirements agreed for your enquiry." },
  { icon: <Boxes />, title: "OEM & bulk support", text: "Share project quantities and delivery expectations for a business-focused response." },
  { icon: <ScanLine />, title: "Custom enquiries", text: "Drawings and application details help us understand your non-standard requirements." },
];

export default async function HomePage() {
  const products = await getPublicProducts();
  return <>
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-kicker"><span /> INDUSTRIAL AIRFLOW · OEM SOLUTIONS</div>
        <h1>Precision engineered.<br /><em>Built for performance.</em></h1>
        <p>Reliable AC motor cooling fan solutions for industrial applications, engineered around your performance and manufacturing requirements.</p>
        <div className="hero-actions"><Link className="button button-copper" href="/products">Explore our products <ArrowRight size={17} /></Link><Link className="button button-glass" href="/quote">Request a quote <ArrowUpRight size={17} /></Link></div>
        <div className="hero-note"><span className="note-line" /> A focused manufacturing partner for your next requirement</div>
      </div>
      <div className="hero-visual">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <FanIllustration variant="hero" />
        <div className="hero-visual-tag"><span>01 / AIRFLOW</span><strong>Designed around<br />the application</strong></div>
        <div className="hero-dimension">Ø <span>ENGINEERED TO SPEC</span></div>
      </div>
      <a className="hero-scroll" href="#featured"><ArrowDown size={14} /> SCROLL TO EXPLORE</a>
      <div className="hero-index">KF — 01</div>
    </section>

    <section className="trust-strip" aria-label="Company focus">
      <span>AC MOTOR COOLING</span><i /><span>INDUSTRIAL COMPONENTS</span><i /><span>OEM ENQUIRIES</span><i /><span>ENGINEERED AIRFLOW</span>
    </section>

    <section className="section section-featured" id="featured">
      <div className="section-heading">
        <div><span className="eyebrow">01 / PRODUCT RANGE</span><h2>Airflow solutions<br /><em>for industry.</em></h2></div>
        <div className="heading-aside"><p>Explore AC motor cooling and related fan components. Technical details are confirmed against each project enquiry.</p><Link className="text-link" href="/products">View all products <ArrowUpRight size={17} /></Link></div>
      </div>
      <div className="product-grid">{products.slice(0, 3).map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div>
      <div className="sample-notice"><span>NOTE / 01</span><p>Confirm product specifications, availability, and pricing with Karnataka Foundry before ordering.</p></div>
    </section>

    <section className="section capability-section" id="about">
      <div className="capability-intro"><span className="eyebrow eyebrow-light">02 / WHY KARNATAKA FOUNDRY</span><h2>Practical support.<br /><em>Built around your needs.</em></h2><p>Clear communication from first technical conversation through quotation. Tell us what your application needs.</p><Link className="button button-glass" href="/quote">Talk to our team <ArrowRight size={17} /></Link><span className="capability-number">KF / 02</span></div>
      <div className="capability-grid">{capabilities.map((item, index) => <article className="capability-card" key={item.title}><span className="capability-icon">{item.icon}</span><small>0{index + 1} / SUPPORT</small><h3>{item.title}</h3><p>{item.text}</p><MoveUpRight className="capability-arrow" size={18} /></article>)}</div>
    </section>

    <section className="section industries-section" id="industries">
      <div className="industries-copy"><span className="eyebrow">03 / APPLICATION LANDSCAPE</span><h2>Made for the<br /><em>work behind work.</em></h2><p>We welcome enquiries from organisations working across these industrial sectors. The list describes target applications, not confirmed customers or endorsements.</p></div>
      <div className="industry-list"><div><span>01</span><strong>Electrical motors</strong><ArrowUpRight size={18} /></div><div><span>02</span><strong>Industrial machinery</strong><ArrowUpRight size={18} /></div><div><span>03</span><strong>HVAC equipment</strong><ArrowUpRight size={18} /></div><div><span>04</span><strong>OEM manufacturing</strong><ArrowUpRight size={18} /></div></div>
      <Factory className="industry-watermark" aria-hidden="true" />
    </section>

    <section className="manufacturing-section" id="quality">
      <div className="manufacturing-visual"><div className="manufacturing-grid" /><div className="manufacturing-ring"><span>ENGINEERED<br />TO REQUIREMENT</span></div><div className="manufacturing-caption"><span>PROCESS / 04</span><strong>Precision begins<br />with understanding.</strong></div></div>
      <div className="manufacturing-copy"><span className="eyebrow">04 / MANUFACTURING APPROACH</span><h2>From specification<br />to <em>finished component.</em></h2><p>Every requirement starts with the right conversation. Share drawings, application details, and inspection expectations so the team can assess your needs.</p><div className="process-steps"><div><span>01</span><strong>Understand</strong><small>Application & requirements</small></div><div><span>02</span><strong>Evaluate</strong><small>Technical review & quotation</small></div><div><span>03</span><strong>Align</strong><small>Scope & next steps</small></div></div><p className="small-disclaimer">Manufacturing imagery and process details are placeholders; verified factory media and capabilities are to be supplied by the company.</p></div>
    </section>

    <section className="closing-cta"><div><span className="eyebrow eyebrow-light">LET'S DISCUSS YOUR APPLICATION</span><h2>Looking for the right<br /><em>cooling fan?</em></h2><p>Share your requirements and our team can help you take the next step.</p></div><div className="closing-actions"><Link className="button button-copper" href="/products">Browse products <ArrowRight size={17} /></Link><Link className="button button-glass" href="/quote">Request a quote <ArrowUpRight size={17} /></Link></div><div className="cta-decoration"><FanIllustration /></div></section>
    <div className="sr-only"><Link href="/products">Products</Link><Link href="/quote">Request a quotation</Link></div>
  </>;
}
