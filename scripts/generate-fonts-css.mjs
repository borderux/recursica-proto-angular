// Resolves brand.fonts.primary/secondary (recursica_brand.json) to their
// typeface's Google Fonts URL (recursica_tokens.json) and writes the
// @import lines for just those to src/recursica_fonts.css. Every step is
// validated with no fallback — a bad or missing source aborts the
// dev-server/build rather than rendering with a silently wrong font.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");

function readJson(relPath) {
  const fullPath = path.join(root, relPath);
  let raw;
  try {
    raw = readFileSync(fullPath, "utf8");
  } catch {
    throw new Error(`generate-fonts-css: cannot read ${relPath}`);
  }
  return JSON.parse(raw);
}

function referencedTypeface(brand, slot) {
  const ref = brand?.brand?.fonts?.[slot]?.$value;
  const match = typeof ref === "string" && ref.match(/^\{tokens\.font\.typefaces\.([^}]+)\}$/);
  if (!match) {
    throw new Error(
      `generate-fonts-css: brand.fonts.${slot}.$value is missing or not a ` +
        `"{tokens.font.typefaces.<name>}" reference (got: ${JSON.stringify(ref)})`,
    );
  }
  return match[1];
}

function googleFontsUrl(tokens, typefaceKey) {
  const entry = tokens?.tokens?.font?.typefaces?.[typefaceKey];
  const url = entry?.$extensions?.["com.google.fonts"]?.url;
  if (typeof url !== "string" || !/^https:\/\/fonts\.googleapis\.com\//.test(url)) {
    throw new Error(
      `generate-fonts-css: tokens.font.typefaces.${typefaceKey} has no valid ` +
        `fonts.googleapis.com URL (got: ${JSON.stringify(url)})`,
    );
  }
  return url;
}

const brand = readJson("recursica_brand.json");
const tokens = readJson("recursica_tokens.json");

const typefaceKeys = new Set(
  ["primary", "secondary"].map((slot) => referencedTypeface(brand, slot)),
);

const lines = [...typefaceKeys]
  .map((key) => googleFontsUrl(tokens, key))
  .map((url) => `@import url("${url}");`);

const outPath = path.join(root, "src/recursica_fonts.css");
writeFileSync(outPath, lines.join("\n") + "\n");
console.log(`generate-fonts-css: wrote ${lines.length} font import(s) to src/recursica_fonts.css`);
