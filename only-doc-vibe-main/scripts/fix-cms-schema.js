#!/usr/bin/env node

/**
 * Post-processing script for cms-schema.ts
 * Removes optional markers (?) from all component fields
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMA_PATH = join(
  __dirname,
  "..",
  "src",
  "shared",
  "api",
  "cms",
  "cms-schema.ts"
);

/**
 * Ensure a generated component type carries its `__component` literal.
 * Operates only on the matched component block so unrelated schemas are
 * untouched, and is a no-op when the discriminator is already present.
 */
function injectComponentDiscriminator(content, typeName, componentUid) {
  const marker = `${typeName}: {`;
  const startIdx = content.indexOf(marker);

  if (startIdx === -1) {
    return content;
  }

  const blockStart = startIdx + marker.length;
  const blockEnd = content.indexOf("};", blockStart);
  const block = content.slice(blockStart, blockEnd);

  if (block.includes("__component")) {
    return content;
  }

  console.log(`   Injected missing __component into ${typeName}`);

  return (
    content.slice(0, blockStart) +
    `\n      __component: "${componentUid}";` +
    content.slice(blockStart)
  );
}

try {
  console.log("🔧 Fixing CMS schema...");

  let content = readFileSync(SCHEMA_PATH, "utf-8");

  // Count before
  const beforeCount = (content.match(/\?: /g) || []).length;

  // Remove optional markers from properties within interfaces/types
  // This regex targets property definitions like "propertyName?: type"
  // and replaces them with "propertyName: type"
  content = content.replace(/(\s+)(\w+)\?: /g, "$1$2: ");

  // Strapi OpenAPI omits __component on some section schemas used in dynamic zones.
  content = content.replace(
    /SectionsFaqComponent: \{\n      id: number;\n      internal_title: string;/g,
    `SectionsFaqComponent: {
      id: number;
      /** @enum {string} */
      __component: "sections.faq";
      internal_title: string;`
  );

  // Count after
  const afterCount = (content.match(/\?: /g) || []).length;

  // Strapi's OpenAPI output omits the `__component` discriminator for the
  // reusable FAQ component, unlike every other dynamic-zone component. Without
  // it, `section.__component` narrowing on the section unions fails to compile.
  // Re-inject the discriminator (scoped strictly to the component block).
  content = injectComponentDiscriminator(
    content,
    "SectionsFaqComponent",
    "sections.faq"
  );

  writeFileSync(SCHEMA_PATH, content, "utf-8");

  console.log(
    `✅ Fixed CMS schema: removed ${beforeCount - afterCount} optional markers`
  );
  console.log(`   Remaining optional markers: ${afterCount}`);
} catch (error) {
  console.error("❌ Error fixing CMS schema:", error.message);
  process.exit(1);
}
