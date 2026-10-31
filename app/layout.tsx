import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteBackgroundVideo } from "@/components/site-background-video";
import { SiteChrome } from "@/components/site-chrome";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Karnatak Foundry | AC Motor Cooling Fan Solutions",
    template: "%s | Karnatak Foundry",
  },
  description:
    "Explore AC motor cooling fan solutions for industrial applications and OEM requirements. Request a technical quotation from Karnatak Foundry.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CartProvider>
            <SiteBackgroundVideo />
            <SiteChrome position="header" />
            <main>{children}</main>
            <SiteChrome position="footer" />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
