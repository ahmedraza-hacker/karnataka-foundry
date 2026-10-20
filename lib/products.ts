export type Product = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  material: string;
  diameter: string;
  bore: string;
  blades: string;
  application: string;
  description: string;
  image: string;
  compatibleFrames?: string;
  minimumOrderQty?: number;
  price?: string | null;
  isSample?: boolean;
};

// All entries are illustrative placeholders, not verified Karnataka Foundry products.
export const products: Product[] = [
  {
    slug: "ac-motor-cooling-fan",
    name: "AC Motor Cooling Fan",
    sku: "SAMPLE-KF-001",
    category: "Motor cooling fans",
    material: "To be confirmed",
    diameter: "To be confirmed",
    bore: "To be confirmed",
    blades: "To be confirmed",
    application: "Electric motor cooling",
    description:
      "Sample catalogue entry for a motor cooling fan. Confirm dimensions, material, and compatibility with the factory before ordering.",
    image: "/product/ac-motor-cooling-fan.png",
  },
  {
    slug: "motor-cooling-impeller",
    name: "Motor Cooling Impeller",
    sku: "SAMPLE-KF-002",
    category: "Cooling impellers",
    material: "To be confirmed",
    diameter: "To be confirmed",
    bore: "To be confirmed",
    blades: "To be confirmed",
    application: "Industrial motor assemblies",
    description:
      "Illustrative impeller listing only. Final specification and application suitability require technical confirmation.",
      image: "/product/motor-cooling-impeller.png",
  },
  {
    slug: "custom-cooling-fan",
    name: "Custom Cooling Fan Solution",
    sku: "SAMPLE-KF-003",
    category: "Custom solutions",
    material: "Application dependent",
    diameter: "Made to enquiry",
    bore: "Made to enquiry",
    blades: "Made to enquiry",
    application: "OEM applications",
    description:
      "A placeholder for custom-engineered requirements. Share a drawing or application details to begin a technical discussion.",
    image: "/product/custom-cooling-fan.png",
  },
  {
    slug: "oem-fan-component",
    name: "OEM Fan Component",
    sku: "SAMPLE-KF-004",
    category: "OEM components",
    material: "To be confirmed",
    diameter: "To be confirmed",
    bore: "To be confirmed",
    blades: "To be confirmed",
    application: "OEM manufacturing",
    description:
      "Sample listing for OEM component enquiries. Product availability, pricing, and lead time have not been confirmed.",
    image: "/product/oem-fan-component.png",
  }
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
