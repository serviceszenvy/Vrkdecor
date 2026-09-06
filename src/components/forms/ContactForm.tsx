"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name") || "").trim()) next.name = "Please tell us who you are.";
    const phone = String(data.get("phone") || "").trim();
    if (!/^[\d\s+()-]{8,}$/.test(phone)) next.phone = "A number we can reach you on.";
    if (!String(data.get("message") || "").trim()) next.message = "A line about the function helps.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <div className="glass glass-raised glass-sheen p-10 text-center" role="status">
        <span className="feature-icon mx-auto">
          <Icon name="check" className="h-5 w-5" />
        </span>
        <h2 className="t-2 mt-6">Thank you, that reached us</h2>
        <p className="lede mt-3 mx-auto">
          Our team will come back to you on the number you gave. If it is urgent, WhatsApp is faster.
        </p>
      </div>
    );
  }

  return (
    <form className="glass glass-sheen p-7 md:p-9 space-y-5" onSubmit={submit} noValidate data-reveal>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="c-name">Your name</label>
          <input id="c-name" name="name" className="input" placeholder="Lakshmi R." aria-invalid={!!errors.name} />
          {errors.name ? <span className="hint text-[var(--color-lime-600)]">{errors.name}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="c-phone">Phone or WhatsApp</label>
          <input id="c-phone" name="phone" type="tel" className="input" placeholder="+91 90000 00000" aria-invalid={!!errors.phone} />
          {errors.phone ? <span className="hint text-[var(--color-lime-600)]">{errors.phone}</span> : null}
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-email">
          Email <span className="hint">optional</span>
        </label>
        <input id="c-email" name="email" type="email" className="input" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="c-message">How can we help</label>
        <textarea id="c-message" name="message" className="textarea" placeholder="Wedding on 14 March in Nagercoil, around 400 guests." aria-invalid={!!errors.message} />
        {errors.message ? <span className="hint text-[var(--color-lime-600)]">{errors.message}</span> : null}
      </div>
      <button type="submit" className="btn btn-primary w-full sm:w-auto">
        Send message
        <Icon name="arrow" className="h-4 w-4" />
      </button>
    </form>
  );
}
