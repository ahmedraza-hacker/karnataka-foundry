
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <article
      className="product-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="product-art"
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-contain bg-white p-4"
          />
        ) : (
          <div className="flex h-full min-h-64 items-center justify-center">
            Image coming soon
          </div>
        )}

        <span className="sample-label">Product preview</span>
        <span className="art-corner">
          KF / {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <div className="product-card-body">
        <div className="product-category">{product.category}</div>

        <h3>
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        <div className="product-meta">
          <span>Part no.</span>
          <strong>{product.sku}</strong>
        </div>

        <div className="product-card-bottom">
          <span className="availability">
            <i /> Quote on request
          </span>

          <Link
            href={`/products/${product.slug}`}
            className="round-arrow"
            aria-label={`View ${product.name}`}
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

