"use client";

import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteChrome({ position }: { position: "header" | "footer" }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  if (position === "header") {
    return (
      <>
        <SiteHeader />
        <BottomNavigation />
      </>
    );
  }

  return <SiteFooter />;
}
