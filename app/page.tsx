import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { getVisibleProducts } from "@/lib/public-products";

export const dynamic = "force-dynamic";

const coolingFanImage = "/product/ac-motor-cooling-fan.png";

export default async function HomePage() {
  const products = await getVisibleProducts();
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <>
      <section className="cinematic-hero" aria-labelledby="hero-heading">
        <div className="cinematic-hero-shade" aria-hidden="true" />
        <div className="cinematic-hero-grid" aria-hidden="true" />
        <div className="cinematic-hero-content">
          <span className="cinematic-eyebrow"><i /> INDUSTRIAL AIRFLOW / KARNATAKA, INDIA</span>
          <h1 id="hero-heading">KARNATAKA<br />FOUNDRY</h1>
          <p className="cinematic-tagline">ENGINEERED FLOW.</p>
          <p className="cinematic-description">
            Precision-engineered AC motor cooling fans and industrial airflow
            solutions designed for performance, reliability and efficiency.
          </p>
          <div className="cinematic-actions">
            <Link className="premium-button premium-button-light" href="/products">
              EXPLORE PRODUCTS <ArrowUpRight size={17} />
            </Link>
            <Link className="premium-button premium-button-glass" href="/quote">
              CONTACT US <ArrowRight size={17} />
            </Link>
          </div>
          <a className="cinematic-scroll" href="#featured-heading">
            <ArrowDown size={16} /> DISCOVER THE RANGE
          </a>
        </div>
        <div className="cinematic-hero-caption" aria-hidden="true">
          <span>AC MOTOR COOLING FAN</span>
          <span>CINEMATIC PRODUCT FILM</span>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="premium-categories" id="range" aria-labelledby="range-heading">
          <div className="premium-section-heading">
            <div>
              <span className="premium-eyebrow">EXPLORE THE CATALOGUE</span>
              <h2 id="range-heading">Find your<br /><em>starting point.</em></h2>
            </div>
            <p>Browse by category, then review the available product details.</p>
          </div>
          <div className="premium-category-list">
            {categories.map((category, index) => {
              const count = products.filter((product) => product.category === category).length;
              return (
                <Reveal key={category}>
                  <Link
                    className="premium-category-row"
                    href={`/products?category=${encodeURIComponent(category)}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{category}</strong>
                    <small>{count} {count === 1 ? "LISTING" : "LISTINGS"}</small>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <section className="premium-products" aria-labelledby="featured-heading">
        <div className="premium-section-heading">
          <div>
            <span className="premium-eyebrow">PRODUCT SYSTEMS</span>
            <h2 id="featured-heading">Made to move<br /><em>air forward.</em></h2>
          </div>
          <Link className="premium-text-link" href="/products">
            VIEW ALL PRODUCTS <ArrowRight size={17} />
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="product-grid premium-product-grid">
            {products.slice(0, 3).map((product, index) => (
              <Reveal key={product.slug} delay={index * 70}>
                <ProductCard product={product} index={index} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="premium-empty">
            The catalogue is temporarily unavailable. Please contact us about your requirements.
          </p>
        )}
        <p className="premium-disclaimer">
          Product previews may be illustrative. Confirm specifications, availability, pricing, and order quantities with the company.
        </p>
      </section>

      <section className="premium-approach">
        <div className="premium-approach-art">
          <Image
            src={coolingFanImage}
            alt="AC motor cooling fan product preview"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <span>PRODUCT PREVIEW / VERIFY SPECIFICATION</span>
        </div>
        <div className="premium-approach-copy">
          <span className="premium-eyebrow">FROM REQUIREMENT TO ENQUIRY</span>
          <h2>Good work begins<br />with a <em>conversation.</em></h2>
          <p>
            Technical fit depends on the application. Share motor details,
            operating conditions, drawings, and inspection expectations so
            the team can review your requirements.
          </p>
          <ol className="premium-steps">
            <li><span>01</span><div><strong>Describe</strong><small>Application and operating conditions</small></div></li>
            <li><span>02</span><div><strong>Share</strong><small>Dimensions, drawings, or part references</small></div></li>
            <li><span>03</span><div><strong>Discuss</strong><small>Scope and next steps through an enquiry</small></div></li>
          </ol>
          <Link className="premium-text-link" href="/quote">
            START AN ENQUIRY <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <section className="premium-contact" id="contact">
        <span className="premium-eyebrow">KARNATAK FOUNDRY / ENGINEERED FLOW</span>
        <h2>Let’s talk<br />about your <em>application.</em></h2>
        <div className="premium-contact-details">
          <p><span>OWNER</span><strong>Abdul Khadar</strong></p>
          <p><span>EMAIL</span><a href="mailto:karnatakfoundry@gmail.com">karnatakfoundry@gmail.com</a></p>
          <p><span>MOBILE</span><a href="tel:9880430017">9880430017</a></p>
          <p><span>ALTERNATE</span><a href="tel:9986333191">9986333191</a></p>
          <Link className="premium-button premium-button-light" href="/quote">
            CONTACT US <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
