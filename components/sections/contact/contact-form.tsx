"use client";

import { useState, useId } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { validateContact, hasErrors, type ContactFields, type ContactErrors } from "@/lib/contact-validation";
import { submitContactForm } from "@/lib/contact-submit";
import { Magnetic } from "@/components/motion/magnetic";

type SubmitStatus = "idle" | "sending" | "success" | "error";

const EMPTY: ContactFields = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState("");
  const uid = useId();

  function update(field: keyof ContactFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateContact(fields);
    if (hasErrors(errs)) {
      setErrors(errs);
      // Move focus to the first invalid field.
      const firstKey = (["name", "email", "subject", "message"] as const).find(
        (k) => errs[k],
      );
      if (firstKey) {
        document.getElementById(`${uid}-${firstKey}`)?.focus();
      }
      return;
    }

    setStatus("sending");
    setServerError("");

    try {
      await submitContactForm(fields);
      setStatus("success");
    } catch {
      setStatus("error");
      setServerError("Something went wrong. Please try again or email me directly.");
    }
  }

  const fieldClass = (field: keyof ContactFields) =>
    `w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
      errors[field] ? "border-red-500" : "border-border"
    }`;

  if (status === "success") {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle className="h-12 w-12 text-accent" aria-hidden="true" />
        <p className="font-display text-2xl text-heading">Message sent!</p>
        <p className="text-sm text-muted">I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Contact form"
      className="space-y-4"
    >
      {/* aria-live error summary */}
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {hasErrors(errors) && `Form has errors: ${Object.values(errors).join(" ")}`}
        {status === "error" && serverError}
      </div>

      {/* Name */}
      <div>
        <label htmlFor={`${uid}-name`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-name`}
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="Jane Doe"
          value={fields.name}
          onChange={(e) => update("name", e.target.value)}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          aria-invalid={!!errors.name}
          className={fieldClass("name")}
        />
        {errors.name && (
          <p id={`${uid}-name-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="your@email.com"
          value={fields.email}
          onChange={(e) => update("email", e.target.value)}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          aria-invalid={!!errors.email}
          className={fieldClass("email")}
        />
        {errors.email && (
          <p id={`${uid}-email-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor={`${uid}-subject`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Subject <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-subject`}
          type="text"
          name="subject"
          required
          placeholder="What's this about?"
          value={fields.subject}
          onChange={(e) => update("subject", e.target.value)}
          aria-describedby={errors.subject ? `${uid}-subject-error` : undefined}
          aria-invalid={!!errors.subject}
          className={fieldClass("subject")}
        />
        {errors.subject && (
          <p id={`${uid}-subject-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor={`${uid}-message`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          required
          placeholder="Your message here..."
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          aria-describedby={errors.message ? `${uid}-message-error` : undefined}
          aria-invalid={!!errors.message}
          className={`${fieldClass("message")} resize-none`}
        />
        {errors.message && (
          <p id={`${uid}-message-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: "none" }}
      />

      {status === "error" && (
        <p role="alert" className="font-mono text-xs text-red-500">{serverError}</p>
      )}

      <Magnetic className="block w-full">
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-mono text-sm text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send Message
            </>
          )}
        </button>
      </Magnetic>
    </form>
  );
}
