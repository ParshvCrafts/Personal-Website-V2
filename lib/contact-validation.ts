export interface ContactFields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};

  if (!fields.name.trim() || fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!fields.email.trim() || !EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!fields.subject.trim() || fields.subject.trim().length < 2) {
    errors.subject = "Subject must be at least 2 characters.";
  }
  if (!fields.message.trim() || fields.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}
