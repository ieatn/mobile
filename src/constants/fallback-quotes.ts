/** Shown when the Edge Function is unavailable */
export const FALLBACK_QUOTES = [
  'We suffer more in imagination than in reality. — Seneca',
  'The best investment is in yourself. — Warren Buffett',
  'Know thyself. — Socrates',
  'An investment in knowledge pays the best interest. — Benjamin Franklin',
  'He who has a why can bear almost any how. — Nietzsche',
  'The only true wisdom is knowing you know nothing. — Socrates',
];

export function pickFallbackQuote() {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}
