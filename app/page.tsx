import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Reveal } from "@/components/reveal";
import { getVisibleProducts } from "@/lib/public-products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getVisibleProducts();
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const heroProduct = products.find((product) => product.image);

  return (
    <>
      <section className="editorial-hero">
        <div className="editorial-hero-copy">
          <span className="editorial-kicker"><i /> INDUSTRIAL AIRFLOW</span>
          <h1>KARNATAKA<br />FOUNDRY</h1>
          <p className="editorial-tagline">ENGINEERED FLOW</p>
          <p>
            AC motor cooling fans and related airflow components for industrial
            applications and OEM requirements.
          </p>
          <div className="editorial-actions">
            <Link className="editorial-button editorial-button-orange" href="/products">
              Explore products <ArrowUpRight size={17} />
            </Link>
            <Link className="editorial-text-link" href="/quote">
              Contact us <ArrowRight size={16} />
            </Link>
          </div>
          <a className="editorial-scroll" href="#range">
            <ArrowDownRight size={15} /> DISCOVER THE RANGE
          </a>
        </div>
        <div className="editorial-hero-image">
          {heroProduct ? (
            <ProductImage
              src={heroProduct.image}
              alt={`Product preview: ${heroProduct.name}`}
              width={1100}
              height={900}
              className="editorial-product-photo"
            />
          ) : (
            <div className="editorial-no-image">PRODUCT PREVIEWS UNAVAILABLE</div>
          )}
          <div className="editorial-image-caption">
            <span>PRODUCT PREVIEW</span>
            <span>01 — AIRFLOW COMPONENTS</span>
          </div>
          <span className="editorial-index" aria-hidden="true">KF / 01</span>
        </div>
        <div className="editorial-hero-foot">
          <span>ENGINEERED AROUND APPLICATION REQUIREMENTS</span>
          <span>PRODUCT DETAILS ARE CONFIRMED THROUGH ENQUIRY</span>
        </div>
      </section>

      <div>
        <section className="editorial-intro" id="about">
          <span className="editorial-overline">A PRACTICAL STARTING POINT</span>
          <div>
            <h2>Components that move<br />air—and work <em>forward.</em></h2>
            <p>
              Explore AC motor cooling fan solutions and related components.
              Share your application, drawings, and technical requirements to
              begin a product conversation.
            </p>
            <Link className="editorial-underlined-link" href="/quote">
              Tell us what you need <ArrowUpRight size={16} />
            </Link>
          </div>
          <span className="editorial-section-number">01 / INTRODUCTION</span>
        </section>

        {categories.length > 0 && (
          <section className="editorial-categories" id="range" aria-labelledby="range-heading">
            <div className="editorial-section-heading">
              <div>
                <span className="editorial-overline">EXPLORE THE CATALOGUE</span>
                <h2 id="range-heading">Find your<br /><em>starting point.</em></h2>
              </div>
              <p>Browse by category, then review the available product details.</p>
            </div>
            <div className="editorial-category-list">
              {categories.map((category, index) => {
                const count = products.filter((product) => product.category === category).length;
                return (
                  <Reveal key={category}>
                    <Link
                      className="editorial-category-row"
                      href={`/products?category=${encodeURIComponent(category)}`}
                    >
                      <span>0{index + 1}</span>
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

        <section className="editorial-featured" aria-labelledby="featured-heading">
          <div className="editorial-featured-heading">
            <div>
              <span className="editorial-overline">SELECTED PRODUCT PREVIEWS</span>
              <h2 id="featured-heading">The catalogue,<br /><em>in focus.</em></h2>
            </div>
            <Link className="editorial-underlined-link" href="/products">
              View all products <ArrowUpRight size={16} />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="product-grid editorial-product-grid">
              {products.slice(0, 3).map((product, index) => (
                <Reveal key={product.slug} delay={index * 80}>
                  <ProductCard product={product} index={index} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="editorial-empty">
              The catalogue is temporarily unavailable. Please contact us about your requirements.
            </p>
          )}
          <p className="editorial-disclaimer">
            Product previews may be illustrative. Confirm specifications, availability, pricing, and order quantities with the company.
          </p>
        </section>

        <section className="editorial-company">
          <div className="editorial-company-image">
            {heroProduct ? (
              <ProductImage
                src={heroProduct.image}
                alt={`Product preview: ${heroProduct.name}`}
                width={900}
                height={900}
                className="editorial-secondary-photo"
              />
            ) : (
              <div className="editorial-no-image">PRODUCT PREVIEWS UNAVAILABLE</div>
            )}
            <span>PRODUCT PREVIEW / VERIFY SPECIFICATION</span>
          </div>
          <div className="editorial-company-copy">
            <span className="editorial-overline">FROM REQUIREMENT TO ENQUIRY</span>
            <h2>Good work begins<br />with a <em>conversation.</em></h2>
            <p>
              Technical fit depends on the application. Share motor details,
              operating conditions, drawings, and inspection expectations so
              the team can review your requirements.
            </p>
            <ol className="editorial-steps">
              <li><span>01</span><div><strong>Describe</strong><small>Application and operating conditions</small></div></li>
              <li><span>02</span><div><strong>Share</strong><small>Dimensions, drawings, or part references</small></div></li>
              <li><span>03</span><div><strong>Discuss</strong><small>Scope and next steps through an enquiry</small></div></li>
            </ol>
            <Link className="editorial-underlined-link" href="/quote">
              Start an enquiry <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        <section className="editorial-contact">
          <span className="editorial-overline">KARNATAKA FOUNDRY / ENGINEERED FLOW</span>
          <h2>Contact<br />Karnataka Foundry.</h2>
          <div className="editorial-contact-details">
            <p><span>OWNER</span><strong>Abdul Khadar</strong></p>
            <p><span>EMAIL</span><a href="mailto:karnatakafoundry@gmail.com">karnatakafoundry@gmail.com</a></p>
            <p><span>MOBILE</span><a href="tel:9880430017">9880430017</a></p>
            <p><span>ALTERNATE</span><a href="tel:9986333191">9986333191</a></p>
            <p>Send your application details and the team can follow up with next steps.</p>
            <Link className="editorial-button editorial-button-light" href="/quote">
              Contact us / Send an enquiry <ArrowUpRight size={17} />
            </Link>
          </div>
          <span className="editorial-contact-index">KF / 02</span>
        </section>
      </div>
    </>
  );
}
