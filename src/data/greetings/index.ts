/**
 * What this dataset is for — shown by the data registry
 * (`src/data/index.ts`) so agents/designers can tell what a dataset is
 * without opening it.
 */
export const description =
  "Sample greeting messages in a few languages, used as the reference example for mock data + mock APIs, including bad-data scenarios.";

/**
 * A single greeting record.
 */
export interface Greeting {
  /** Stable identifier for the greeting. */
  id: string;
  /** The greeting text, e.g. "Hello, world!". */
  message: string;
  /** BCP 47 language tag the greeting is written in, e.g. "en". */
  locale: string;
}

/** The normal-case dataset: valid greetings, in a few different languages. */
export const greetings: Greeting[] = [
  { id: "1", message: "Hello, world!", locale: "en" },
  { id: "2", message: "¡Hola, mundo!", locale: "es" },
  { id: "3", message: "Bonjour, le monde !", locale: "fr" },
];

/**
 * Bad-data set: a well-formed but empty response, e.g. "no results yet".
 * Use this to check the UI's empty state.
 */
export const emptyGreetings: Greeting[] = [];

/**
 * Bad-data set: malformed records (missing/wrong-typed fields), for
 * checking how the UI copes with a response that doesn't match the
 * schema. Deliberately typed as `unknown[]`, not `Greeting[]` — the
 * mismatch is the point.
 */
export const malformedGreetings: unknown[] = [
  { id: "1" }, // missing message/locale
  { id: 2, message: 42, locale: "en" }, // wrong field types
  null,
];
