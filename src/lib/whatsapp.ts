const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function normalizeWhatsapp(raw: string): string {
  return raw.replace(/[\s()-]/g, "").trim();
}

export function isValidE164(value: string): boolean {
  return E164_REGEX.test(normalizeWhatsapp(value));
}
