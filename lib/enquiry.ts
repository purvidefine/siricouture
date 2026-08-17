/**
 * enquiry.ts — the single place a "talk to the studio" link is built.
 *
 * Deliberately NOT inside a 'use client' module: server components import this,
 * and a function exported across the client boundary cannot be serialised.
 *
 * Until a WhatsApp number is configured in lib/brand.ts, every enquiry link
 * falls back to the commission page, so no CTA is ever dead.
 */

import { BRAND } from './brand';

const DEFAULT_MESSAGE = 'Hello Siri Couture — I would like to enquire about a piece.';

export function enquiryHref(message?: string): string {
  if (!BRAND.whatsapp) return '/commission';
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message ?? DEFAULT_MESSAGE)}`;
}
