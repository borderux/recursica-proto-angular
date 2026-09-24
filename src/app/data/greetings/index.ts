export const description =
  'Simple greeting records — the reference example for a mock dataset with good, empty, and malformed variants.';

export interface Greeting {
  id: number;
  message: string;
  locale: string;
}

/** Good-case data. */
export const greetings: Greeting[] = [
  { id: 1, message: 'Hello!', locale: 'en-US' },
  { id: 2, message: 'Bonjour !', locale: 'fr-FR' },
  { id: 3, message: '¡Hola!', locale: 'es-ES' },
];

/** Empty result — tests the empty state. */
export const emptyGreetings: Greeting[] = [];

/** Malformed records — missing/wrong-typed fields, deliberately schema-violating. */
export const malformedGreetings: unknown[] = [
  { id: 'not-a-number', message: 'Oops', locale: 'en-US' },
  { id: 4, locale: 'en-US' },
  null,
];
