
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileDown,
  MoveUpRight,
} from "lucide-react";
import { AddToBasket } from "@/components/add-to-basket";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { getVisibleProducts } from "@/lib/public-products";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const products = await getVisibleProducts();
  const product = products.find((item) => item.slug === slug);

  return {
    title: product?.name ?? "Product not found",
    description: product?.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getVisibleProducts();
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const related = products
    .filter((item) => item.slug !== slug)
    .slice(0, 2);

  const specs = [
    ["Part number", product.sku],
    ["Category", product.category],
    ["Material", product.material],
    ["Outer diameter", product.diameter],
    ["Inner diameter / bore", product.bore],
    ["Number of blades", product.blades],
    ["Application", product.application],
    ["Compatible motor frames", product.compatibleFrames ?? "To be confirmed"],
    [
      "Price",
      product.price
        ? Number(product.price).toLocaleString("en-IN", { style: "currency", currency: "INR" })
        : "Quotation required",
    ],
    ["Minimum order quantity", product.minimumOrderQty?.toLocaleString() ?? "To be confirmed"],
  ];

  return (
    <div className="page-shell">
      <div className="detail-top">
        <Link href="/products" className="back-link">
          <ArrowLeft size={15} />
          Back to catalogue
        </Link>
        <span>PRODUCT / {product.sku}</span>
      </div>

      <section className="product-detail">
        <div className="detail-art">
          <span className="sample-label">Product preview</span>

          <ProductImage
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="h-full w-full rounded-xl bg-white object-contain p-6"
            fallbackClassName="flex min-h-80 items-center justify-center text-sm text-slate-500"
          />

          <span className="detail-art-caption">
            PRODUCT PREVIEW / VERIFY SPECIFICATIONS
          </span>
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="sku-line">
            PART NO. <strong>{product.sku}</strong>
            <span className="availability">
              <i /> Quote on request
            </span>
          </div>

          <p>{product.description}</p>

          <div className="detail-callout">
            <Check size={16} />
            <span>
              Price, availability, and technical fit are confirmed
              through a quotation enquiry.
            </span>
          </div>

          <div className="detail-actions">
            <AddToBasket slug={product.slug} />

            <Link
              className="button button-copper"
              href={`/quote?product=${encodeURIComponent(product.sku)}`}
            >
              Request a quote <ArrowRight size={17} />
            </Link>
          </div>

          <div className="detail-links">
            <span>
              <FileDown size={16} /> Datasheet not yet available
            </span>
            <span>
              <MoveUpRight size={15} /> Contact sales for technical assistance
            </span>
          </div>
        </div>
      </section>

      <section className="specification-section">
        <div className="spec-intro">
          <span className="eyebrow">TECHNICAL INFORMATION</span>
          <h2>Specifications</h2>
          <p>
            Items marked “to be confirmed” are placeholders, not product claims.
          </p>
        </div>

        <dl className="spec-table">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="related-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DISCOVER MORE</span>
            <h2>
              Related <em>categories.</em>
            </h2>
          </div>

          <Link className="text-link" href="/products">
            All products <ArrowRight size={17} />
          </Link>
        </div>

        <div className="product-grid">
          {related.map((item, index) => (
            <ProductCard
              key={item.slug}
              product={item}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
