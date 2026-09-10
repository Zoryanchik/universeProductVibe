import "dotenv/config";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_OPENAPI_URL =
  "https://giving-crown-044b1c58a6.strapiapp.com/documentation/v1.0.0";
const OPENAPI_URL = process.env.OPENAPI_URL ?? DEFAULT_OPENAPI_URL;

const extractSpecObject = (content) => {
  const specIndex = content.indexOf("spec:");
  if (specIndex === -1) {
    throw new Error("Unable to find `spec:` in documentation response.");
  }

  const braceStart = content.indexOf("{", specIndex);
  if (braceStart === -1) {
    throw new Error("Unable to locate spec JSON object start.");
  }

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = braceStart; i < content.length; i += 1) {
    const char = content[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return content.slice(braceStart, i + 1);
      }
    }
  }

  throw new Error("Unable to parse spec JSON object.");
};

const run = async () => {
  const response = await fetch(OPENAPI_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI docs: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  const specText = extractSpecObject(text);
  const spec = JSON.parse(specText);

  const outputPath = join(__dirname, "..", "openapi-spec.json");
  await writeFile(outputPath, JSON.stringify(spec));
  console.log(`✅ OpenAPI spec extracted to ${outputPath}`);
};

run().catch((error) => {
  console.error("❌ Failed to extract OpenAPI spec:", error.message);
  process.exit(1);
});
