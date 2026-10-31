import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Building2,
  Handshake,
  MessageCircleMore,
  PackageCheck,
  Search,
  Truck,
  Workflow,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About Karnatak Foundry",
  description:
    "Learn about Karnatak Foundry's industrial product sourcing, supplier coordination, and supply network for AC motor cooling fans and OEM components.",
};

const services = [
  {
    icon: Workflow,
    number: "01",
    title: "AC Motor Cooling Fans",
    description:
      "Connect with product sources for AC motor cooling fans, with requirements and suitability confirmed for each enquiry.",
  },
  {
    icon: Boxes,
    number: "02",
    title: "Motor Cooling Impellers",
    description:
      "Explore impeller sourcing options and coordinate product details around the buyer's stated application and requirements.",
  },
  {
    icon: Building2,
    number: "03",
    title: "OEM Fan Components",
    description:
      "Coordinate enquiries for fan components and OEM-related supply requirements between buyers and product sources.",
  },
  {
    icon: Search,
    number: "04",
    title: "Custom Cooling Fan Solutions",
    description:
      "Share the application, drawings, or part references so suitable sourcing options can be discussed and confirmed.",
  },
  {
    icon: PackageCheck,
    number: "05",
    title: "Industrial Product Sourcing",
    description:
      "Help businesses identify relevant suppliers and coordinate sourcing conversations for industrial products.",
  },
  {
    icon: Handshake,
    number: "06",
    title: "Supplier and Buyer Coordination",
    description:
      "Support clear communication between buyers, manufacturers, and suppliers from enquiry through order coordination.",
  },
];

const businessModels = [
  {
    number: "01",
    title: "Direct supply",
    description:
      "Products may be supplied or resold directly, subject to confirmed availability, commercial terms, and order details.",
  },
  {
    number: "02",
    title: "Brokerage",
    description:
      "We can coordinate introductions and enquiries between buyers and manufacturers for suitable product requirements.",
  },
  {
    number: "03",
    title: "Supplier partnerships",
    description:
      "We work with suppliers through commission-based arrangements where the commercial terms are agreed between the parties.",
  },
];

const process = [
  {
    icon: MessageCircleMore,
    title: "Customer enquiry",
    description: "You share the product, application, or sourcing requirement.",
  },
  {
    icon: Search,
    title: "Requirement understanding",
    description: "We clarify the details needed to take the enquiry forward.",
  },
  {
    icon: Handshake,
    title: "Supplier coordination",
    description: "We connect with relevant suppliers or manufacturers.",
  },
  {
    icon: Workflow,
    title: "Quotation and confirmation",
    description: "Product details, pricing, and terms are reviewed for confirmation.",
  },
  {
    icon: PackageCheck,
    title: "Order processing",
    description: "The order proceeds according to the agreed commercial details.",
  },
  {
    icon: Truck,
    title: "Delivery coordination",
    description: "We coordinate delivery communication with the relevant parties.",
  },
];

const reasons = [
  "An industrial product focus",
  "A customer-oriented approach",
  "Supplier network coordination",
  "Clear communication",
  "Flexible sourcing and supply models",
  "A focus on long-term business relationships",
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-heading">
        <div className="about-hero-content">
          <span className="about-eyebrow"><i /> COMPANY PROFILE / KARNATAK FOUNDRY</span>
          <h1 id="about-heading">Industrial supply,<br />built on <em>connection.</em></h1>
          <p>
            Connecting businesses with manufacturers and suppliers across AC
            motor cooling fans, impellers, OEM components, and industrial
            cooling solutions.
          </p>
          <div className="about-hero-actions">
            <Link className="premium-button premium-button-light" href="/quote">
              DISCUSS A REQUIREMENT <ArrowUpRight size={17} />
            </Link>
            <a className="about-scroll-link" href="#who-we-are">
              OUR APPROACH <ArrowDown size={16} />
            </a>
          </div>
        </div>
        <div className="about-hero-index" aria-hidden="true">KF / 01</div>
      </section>

      <section className="about-who" id="who-we-are" aria-labelledby="who-heading">
        <div className="about-section-index">01 / WHO WE ARE</div>
        <div className="about-who-copy">
          <span className="about-eyebrow">A PRACTICAL INDUSTRIAL PARTNER</span>
          <h2 id="who-heading">We bring product needs<br />and supply networks <em>together.</em></h2>
          <p>
            Karnatak Foundry is an industrial-focused business working with
            AC motor cooling fans, impellers, OEM components, and industrial
            cooling solutions. We aim to connect businesses with suitable
            manufacturers and suppliers through a reliable sourcing and
            supply network.
          </p>
          <p>
            Every enquiry is an opportunity to understand what is needed,
            coordinate with relevant product sources, and make the next
            commercial steps clear. Product specifications, availability,
            pricing, and delivery arrangements are confirmed with the
            relevant parties.
          </p>
        </div>
      </section>

      <section className="about-services" aria-labelledby="services-heading">
        <div className="about-section-heading">
          <div>
            <span className="about-eyebrow">WHAT WE DO / 02</span>
            <h2 id="services-heading">Focused on industrial<br /><em>products and sourcing.</em></h2>
          </div>
          <p>
            From a specific component enquiry to supplier coordination, we
            help move product conversations forward.
          </p>
        </div>
        <div className="about-service-grid">
          {services.map(({ icon: Icon, number, title, description }, index) => (
            <Reveal key={title} delay={(index % 3) * 55}>
              <article className="about-light-card about-service-card">
                <div className="about-card-topline">
                  <span>{number}</span>
                  <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-model" aria-labelledby="model-heading">
        <div className="about-section-heading">
          <div>
            <span className="about-eyebrow">OUR BUSINESS MODEL / 03</span>
            <h2 id="model-heading">Flexible ways<br />to <em>work together.</em></h2>
          </div>
          <p>
            The commercial approach depends on the product, sourcing
            requirement, and terms agreed by the parties.
          </p>
        </div>
        <div className="about-model-grid">
          {businessModels.map((model, index) => (
            <Reveal key={model.number} delay={index * 70}>
              <article className="about-light-card about-model-card">
                <span className="about-model-number">{model.number}</span>
                <h3>{model.title}</h3>
                <p>{model.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-process" aria-labelledby="process-heading">
        <div className="about-section-heading">
          <div>
            <span className="about-eyebrow">HOW WE WORK / 04</span>
            <h2 id="process-heading">A clear path from<br />enquiry to <em>coordination.</em></h2>
          </div>
          <p>
            Each step is coordinated around the enquiry and the terms
            confirmed with the buyer and product source.
          </p>
        </div>
        <div className="about-process-grid">
          {process.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={(index % 3) * 55}>
              <article className="about-process-step">
                <div className="about-process-topline">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-reasons" aria-labelledby="reasons-heading">
        <div className="about-reasons-copy">
          <span className="about-eyebrow">WHY KARNATAK FOUNDRY / 05</span>
          <h2 id="reasons-heading">Business built<br />around <em>people.</em></h2>
          <p>
            Good sourcing depends on understanding requirements and keeping
            buyers and suppliers aligned. Our approach is practical,
            communicative, and focused on building relationships that can
            support future business.
          </p>
        </div>
        <ul className="about-reason-list">
          {reasons.map((reason, index) => (
            <li key={reason}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{reason}</strong>
              <ArrowRight size={16} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      <section className="about-vision" aria-labelledby="vision-heading">
        <span className="about-eyebrow">OUR VISION / 06</span>
        <h2 id="vision-heading">
          To become a trusted industrial sourcing and supply partner—connecting
          businesses with relevant products, dependable supplier relationships,
          and clear coordination.
        </h2>
        <span className="about-vision-signature">KARNATAK FOUNDRY / ENGINEERED FLOW</span>
      </section>

      <section className="about-contact" aria-labelledby="about-contact-heading">
        <div className="about-contact-copy">
          <span className="about-eyebrow">START A CONVERSATION / 07</span>
          <h2 id="about-contact-heading">Let’s discuss<br />what you <em>need.</em></h2>
          <p>
            Share a product reference, application, or sourcing requirement.
            We’ll help coordinate the next conversation.
          </p>
          <Link className="premium-button premium-button-light" href="/quote">
            CONTACT KARNATAK FOUNDRY <ArrowRight size={17} />
          </Link>
        </div>
        <address className="about-contact-card">
          <span className="about-contact-brand">KF</span>
          <strong>Karnatak Foundry</strong>
          <span>Owner · Abdul Khadar</span>
          <a href="mailto:karnatakafoundry@gmail.com">karnatakafoundry@gmail.com</a>
          <a href="tel:9880430017">9880430017</a>
          <a href="tel:9986333191">9986333191 <span>ALTERNATIVE</span></a>
        </address>
      </section>
    </div>
  );
}
