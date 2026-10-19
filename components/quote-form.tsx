"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type QuoteFormProps = { productReference?: string };

export function QuoteForm({ productReference = "" }: QuoteFormProps) {
  const { clear } = useCart();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string; reference?: string };
      if (!response.ok) throw new Error(result.error ?? "We couldn't submit your enquiry. Please try again.");
      if (!result.reference) throw new Error("The enquiry response was incomplete. Please contact the company before retrying.");
      setReference(result.reference);
      clear();
      setState("sent");
      form.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't submit your enquiry. Please try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return <div className="form-success" role="status"><CheckCircle2 size={30} /><h2>Enquiry received</h2><p>Your enquiry was saved. Reference: <strong>{reference}</strong>. Our team can follow up using the contact details you provided.</p><button className="button button-outline" onClick={() => setState("idle")}>Send another enquiry</button></div>;
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="honeypot" aria-hidden="true">Leave this field blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label>Contact name <span>*</span><input name="customerName" autoComplete="name" required maxLength={120} /></label>
        <label>Company name <span>*</span><input name="companyName" autoComplete="organization" required maxLength={160} /></label>
        <label>Business email <span>*</span><input type="email" name="email" autoComplete="email" required maxLength={254} /></label>
        <label>Phone number <span>*</span><input type="tel" name="phone" autoComplete="tel" required maxLength={30} /></label>
        <label>Product / part number or basket items<input name="productReference" defaultValue={productReference} maxLength={500} /></label>
        <label>Required quantity<input type="number" name="quantity" min="1" max="1000000" inputMode="numeric" /></label>
        <label className="form-wide">Application or motor details<textarea name="applicationDetails" rows={3} maxLength={2000} placeholder="Motor frame, application, operating conditions..." /></label>
        <label className="form-wide">Technical requirements<textarea name="technicalNeeds" rows={3} maxLength={3000} placeholder="Dimensions, material, drawing references, or other requirements..." /></label>
        <label className="form-wide">Additional message<textarea name="message" rows={3} maxLength={3000} /></label>
      </div>
      <div className="form-foot"><p>Fields marked * are required. Please do not include sensitive personal or payment information.</p><button className="button button-copper" type="submit" disabled={state === "sending"}>{state === "sending" ? <>Submitting <LoaderCircle className="spin" size={17} /></> : <>Submit enquiry <ArrowRight size={17} /></>}</button></div>
      {state === "error" && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
