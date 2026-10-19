"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function AddToBasket({ slug }: { slug: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return <button className="button button-dark" type="button" onClick={() => { add(slug, 1); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}>
    {added ? <><Check size={17} /> Added to basket</> : <><ShoppingBag size={17} /> Add to enquiry basket</>}
  </button>;
}
