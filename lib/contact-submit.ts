import type { ContactFields } from "@/lib/contact-validation";

/**
 * Web3Forms submission endpoint + public access key. The access key is a
 * client-side form identifier (not an auth secret) — see https://web3forms.com.
 * Kept out of the form component so the presentational layer carries no network
 * concern.
 */
const ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = "510ff904-9c86-4c43-acce-03ba01e12a12";

/** POST the contact fields to Web3Forms. Resolves on success, throws on failure. */
export async function submitContactForm(fields: ContactFields): Promise<void> {
  const payload = new FormData();
  payload.append("access_key", ACCESS_KEY);
  payload.append("name", fields.name.trim());
  payload.append("email", fields.email.trim());
  payload.append("subject", fields.subject.trim());
  payload.append("message", fields.message.trim());
  // Honeypot — bots fill this; real users leave it empty.
  payload.append("botcheck", "");

  const res = await fetch(ENDPOINT, { method: "POST", body: payload });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}
