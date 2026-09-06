"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { occasions, styles } from "@/lib/content/site";

const STEPS = ["The day", "The look", "You"];

export default function QuoteForm() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    occasion: "Wedding",
    date: "",
    venue: "",
    style: "Traditional",
    services: "",
    name: "",
    phone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !form.date) e.date = "We need the date to check availability.";
    if (step === 2) {
      if (!form.name.trim()) e.name = "Please tell us who you are.";
      if (!/^[\d\s+()-]{8,}$/.test(form.phone.trim())) e.phone = "A number we can reach you on.";
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step === 2) setSent(true);
    else setStep(step + 1);
  };

  if (sent) {
    return (
      <div className="glass glass-raised glass-sheen p-10 text-center" role="status">
        <span className="feature-icon mx-auto">
          <Icon name="check" className="h-5 w-5" />
        </span>
        <h2 className="t-2 mt-6">Your enquiry is with us</h2>
        <p className="lede mt-3 mx-auto">
          We have your {form.occasion.toLowerCase()} on {form.date || "the date you gave"}. Our team will follow up on
          the phone or on WhatsApp to talk through what you need.
        </p>
      </div>
    );
  }

  return (
    <div className="glass glass-sheen p-7 md:p-9" data-reveal>
      <div className="progress-rail mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="contents">
            <span className="progress-dot" data-on={i <= step}>
              <i>{i < step ? "✓" : i + 1}</i>
              <span className="hidden sm:inline">{s}</span>
            </span>
            {i < STEPS.length - 1 ? <span className="progress-line" /> : null}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="q-occasion">Occasion</label>
            <select id="q-occasion" className="select" value={form.occasion} onChange={(e) => set("occasion", e.target.value)}>
              {occasions.map((o) => (
                <option key={o.slug}>{o.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="q-date">Date</label>
            <input id="q-date" type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} aria-invalid={!!errors.date} />
            {errors.date ? <span className="hint text-[var(--color-lime-600)]">{errors.date}</span> : null}
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="q-venue">
              Venue <span className="hint">optional</span>
            </label>
            <input id="q-venue" className="input" placeholder="Venue name, town" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          <div className="field">
            <label>Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button key={s} type="button" className="pill" data-active={form.style === s} onClick={() => set("style", s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="q-services">
              Anything specific <span className="hint">optional</span>
            </label>
            <textarea id="q-services" className="textarea" placeholder="Stage and mandap plus the entrance. Lighting is already arranged." value={form.services} onChange={(e) => set("services", e.target.value)} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="q-name">Your name</label>
            <input id="q-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
            {errors.name ? <span className="hint text-[var(--color-lime-600)]">{errors.name}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="q-phone">Phone or WhatsApp</label>
            <input id="q-phone" type="tel" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />
            {errors.phone ? <span className="hint text-[var(--color-lime-600)]">{errors.phone}</span> : null}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          {step === 2 ? "Send enquiry" : "Continue"}
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
