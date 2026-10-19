import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Karnataka Foundry | AC Motor Cooling Fan Solutions",
    template: "%s | Karnataka Foundry",
  },
  description: "Explore AC motor cooling fan solutions for industrial applications and OEM requirements. Request a technical quotation from Karnataka Foundry.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><SiteHeader /><main>{children}</main><SiteFooter /></CartProvider></body></html>;
}
