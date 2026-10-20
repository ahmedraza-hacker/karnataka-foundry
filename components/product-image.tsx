"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackClassName?: string;
};

export function ProductImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackClassName = "flex min-h-64 w-full items-center justify-center text-sm text-slate-500",
}: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!src || failedSource === src) {
    return <div className={fallbackClassName}>Product image coming soon</div>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailedSource(src)}
    />
  );
}
