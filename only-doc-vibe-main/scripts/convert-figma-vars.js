import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert RGB values (0-1 range) to hex color
 */
function rgbToHex(r, g, b, a = 1) {
  const toHex = (value) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (a < 1) {
    const alphaHex = Math.round(a * 255).toString(16);
    const alpha = alphaHex.length === 1 ? "0" + alphaHex : alphaHex;
    return `${hex}${alpha}`;
  }

  return hex;
}

/**
 * Convert font weight string to numeric value
 */
function fontWeightToNumber(weight) {
  const weightMap = {
    thin: 100,
    hairline: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    normal: 400,
    regular: 400,
    medium: 500,
    semibold: 600,
    "semi bold": 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  };

  const normalized = weight.toLowerCase().trim();
  return weightMap[normalized] || 400;
}

/**
 * Normalize string to kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convert font variable name to CSS variable name
 */
function processFontVariableName(figmaName) {
  const name = figmaName.toLowerCase();

  // Handle "font styles/Title 2 Desktop/font size" -> "text-desktop-title-2-size"
  // Handle "font styles/General/body 2 size" -> "text-body-2-size"
  if (name.includes("font styles")) {
    const parts = name.split("/");
    if (parts.length >= 3) {
      const style = parts[1].trim(); // "Title 2 Desktop" or "General"
      const prop = parts[2].trim(); // "font size", "body 2 height", "body Emph weight"

      // Extract title number and type (desktop/mobile)
      const isDesktop = style.includes("desktop");
      const isMobile = style.includes("mobile");
      const isGeneral = style.includes("general");

      if (isGeneral) {
        // Handle "General/body 2 size", "General/body height", "General/subtitle Emph weight"
        let bodyType = "";

        // Check for body 2 first (more specific)
        if (prop.includes("body 2")) {
          bodyType = "body-2";
        } else if (prop.includes("body")) {
          bodyType = "body";
        } else if (prop.includes("subtitle")) {
          bodyType = "subtitle";
        } else if (prop.includes("caption xs")) {
          bodyType = "caption-xs";
        } else if (prop.includes("caption")) {
          bodyType = "caption";
        }

        if (!bodyType) {
          // Fallback if we can't determine type
          return `text-${toKebabCase(prop)}`;
        }

        if (prop.includes("size")) {
          return `text-${bodyType}-size`;
        } else if (prop.includes("height") || prop.includes("line")) {
          return `text-${bodyType}--line-height`;
        } else if (prop.includes("emph") && prop.includes("weight")) {
          return `text-${bodyType}-emph--font-weight`;
        } else if (prop.includes("weight")) {
          return `text-${bodyType}--font-weight`;
        }
      } else {
        // Handle Desktop/Mobile titles
        // Extract title number
        const titleMatch = style.match(/title\s*(\d+)/i);
        const leadingMatch = style.match(/leading/i);

        let baseName = "";
        if (leadingMatch) {
          baseName = isDesktop ? "text-leading-desktop" : "text-leading-mobile";
        } else if (titleMatch) {
          const num = titleMatch[1];
          baseName = isDesktop
            ? `text-desktop-title-${num}`
            : `text-mobile-title-${num}`;
        }

        if (!baseName) {
          return `text-${toKebabCase(name)}`;
        }

        if (prop.includes("size")) {
          return `${baseName}-size`;
        } else if (prop.includes("height") || prop.includes("line")) {
          return `${baseName}--line-height`;
        } else if (prop.includes("weight")) {
          return `${baseName}--font-weight`;
        }
      }
    }
  }

  // Fallback: convert to kebab-case
  return `text-${toKebabCase(name)}`;
}

/**
 * Convert color variable name to CSS variable name
 */
function processColorVariableName(figmaName) {
  const name = figmaName.toLowerCase();

  // Remove "main color variables/" prefix
  let cleanName = name.replace(/^main color variables\//i, "");

  // Handle primary colors
  if (cleanName.includes("primary/primary-main")) return "color-primary";
  if (cleanName.includes("primary/primary-light")) return "color-primary-light";
  if (cleanName.includes("primary/primary-dark")) return "color-primary-dark";
  if (cleanName.includes("primary/primary-contrast"))
    return "color-primary-contrast-text";
  if (cleanName.includes("state/primary/primary-hover"))
    return "color-state-primary-hover";
  if (cleanName.includes("state/primary/primary-50%"))
    return "color-state-primary-50";

  // Handle secondary colors
  if (cleanName.includes("secondary/secondary-main")) return "color-secondary";
  if (cleanName.includes("secondary/secondary-light"))
    return "color-secondary-light";
  if (cleanName.includes("secondary/secondary-dark"))
    return "color-secondary-dark";
  if (cleanName.includes("secondary/secondary-contrast"))
    return "color-secondary-contrast-text";
  if (cleanName.includes("state/secondary/secondary-hover"))
    return "color-state-secondary-hover";
  if (cleanName.includes("state/secondary/secondary-50%"))
    return "color-state-secondary-50";

  // Handle state colors
  if (cleanName.includes("state/action/action-hover"))
    return "color-action-hover";

  // Handle action colors
  if (cleanName.includes("action colors/active")) return "color-action-active";
  if (cleanName.includes("action colors/hover")) return "color-action-hover";
  if (cleanName.includes("action colors/selected"))
    return "color-action-selected";
  if (cleanName.includes("action colors/disabledbackground"))
    return "color-action-disabled-bg";
  if (cleanName.includes("action colors/stroke")) return "color-action-stroke";
  if (cleanName.includes("action colors/disabled"))
    return "color-action-disabled";
  if (cleanName.includes("action colors/action-main"))
    return "color-action-active";
  if (cleanName.includes("action colors/action-light"))
    return "color-action-hover";
  if (cleanName.includes("action colors/action-dark"))
    return "color-action-selected";
  if (cleanName.includes("action colors/action-contrasttext"))
    return "color-action-disabled";

  // Handle background colors
  if (cleanName.includes("background colors/white bg"))
    return "color-bg-white-bg";
  if (cleanName.includes("background colors/light grey"))
    return "color-bg-light-grey";
  if (cleanName.includes("background colors/blue grey"))
    return "color-bg-blue-grey";
  if (cleanName.includes("background colors/dark blue grey"))
    return "color-bg-dark-blue-grey";
  if (cleanName.includes("background colors/dark background"))
    return "color-bg-dark";

  // Handle common colors
  if (cleanName.includes("common colors/black")) return "color-common-black";
  if (cleanName.includes("common colors/white")) return "color-common-white";

  // Handle text colors
  if (cleanName.includes("text colors/primary")) return "color-text-primary";
  if (cleanName.includes("text colors/secondary"))
    return "color-text-secondary";
  if (cleanName.includes("text colors/disabled")) return "color-text-disabled";

  // Handle error colors
  if (cleanName.includes("error/main")) return "color-error-main";
  if (cleanName.includes("error/light")) return "color-error-light";
  if (cleanName.includes("error/dark")) return "color-error-dark";
  if (cleanName.includes("error/contrasttext"))
    return "color-error-contrast-text";
  if (cleanName.includes("error/state/hoveropacity"))
    return "color-error-state-hover-opacity";
  if (cleanName.includes("error/state/selectedopacity"))
    return "color-error-state-selected-opacity";
  if (cleanName.includes("error/state/main-50"))
    return "color-error-state-main-50";

  // Handle warning colors
  if (cleanName.includes("warning/main")) return "color-warning-main";
  if (cleanName.includes("warning/light")) return "color-warning-light";
  if (cleanName.includes("warning/dark")) return "color-warning-dark";
  if (cleanName.includes("warning/contrasttext"))
    return "color-warning-contrast-text";
  if (cleanName.includes("warning/state/hoveropacity"))
    return "color-warning-state-hover-opacity";
  if (cleanName.includes("warning/state/selectedopacity"))
    return "color-warning-state-selected-opacity";
  if (cleanName.includes("warning/state/main-50"))
    return "color-warning-state-main-50";

  // Handle success colors
  if (cleanName.includes("success/main")) return "color-success-main";
  if (cleanName.includes("success/light")) return "color-success-light";
  if (cleanName.includes("success/dark")) return "color-success-dark";
  if (cleanName.includes("success/contrasttext"))
    return "color-success-contrast-text";
  if (cleanName.includes("success/state/hoveropacity"))
    return "color-success-state-hover-opacity";
  if (cleanName.includes("success/state/selectedopacity"))
    return "color-success-state-selected-opacity";
  if (cleanName.includes("success/state/main-50"))
    return "color-success-state-main-50";

  // Handle info colors
  if (cleanName.includes("info/main")) return "color-info-main";
  if (cleanName.includes("info/light")) return "color-info-light";
  if (cleanName.includes("info/dark")) return "color-info-dark";
  if (cleanName.includes("info/contrasttext"))
    return "color-info-contrast-text";
  if (cleanName.includes("info/state/hoveropacity"))
    return "color-info-state-hover-opacity";
  if (cleanName.includes("info/state/selectedopacity"))
    return "color-info-state-selected-opacity";
  if (cleanName.includes("info/state/main-50"))
    return "color-info-state-main-50";

  // Handle other service colors
  if (cleanName.includes("other service colors")) {
    const servicePart = cleanName.replace(/^other service colors\//i, "");
    if (servicePart.includes("divider")) return "color-os-divider";
    if (servicePart.includes("outline border"))
      return "color-os-outline-border";
    if (servicePart.includes("standard input line"))
      return "color-os-standard-input-line";
    if (
      servicePart.includes("filled input background") &&
      !servicePart.includes("disabled")
    )
      return "color-os-filled-input-bg";
    if (servicePart.includes("filled input disabled background"))
      return "color-os-filled-input-disabled-background";
    if (servicePart.includes("backdrop overlay"))
      return "color-os-backdrop-overlay";
    if (servicePart.includes("snackbar background"))
      return "color-os-snackbar-bg";
    if (servicePart.includes("button outline action border"))
      return "color-os-button-outline-action-border";
    if (servicePart.includes("tooltip")) return "color-bg-tooltip";
  }

  // Generic fallback
  return `color-${toKebabCase(cleanName)}`;
}

/**
 * Process spacings
 */
function processSpacings(data) {
  const variables = new Map();
  const categories = {
    micro: [],
    small: [],
    medium: [],
    large: [],
    huge: [],
    zero: [],
  };

  data.variables.forEach((variable) => {
    const name = variable.name.toLowerCase();
    const modeKey = Object.keys(variable.resolvedValuesByMode)[0];
    const value = variable.resolvedValuesByMode[modeKey].resolvedValue;

    let cssName = "";
    if (name === "0" || value === 0) {
      cssName = "--spacing-zero";
    } else if (name.includes("micro interval")) {
      const match = name.match(/(\d+)/);
      cssName = match
        ? `--spacing-micro-${match[1]}`
        : `--spacing-${toKebabCase(name)}`;
    } else if (name.includes("small interval")) {
      const match = name.match(/(\d+)/);
      cssName = match
        ? `--spacing-small-${match[1]}`
        : `--spacing-${toKebabCase(name)}`;
    } else if (name.includes("medium interval")) {
      const match = name.match(/(\d+)/);
      cssName = match
        ? `--spacing-medium-${match[1]}`
        : `--spacing-${toKebabCase(name)}`;
    } else if (name.includes("large interval")) {
      const match = name.match(/(\d+)/);
      cssName = match
        ? `--spacing-large-${match[1]}`
        : `--spacing-${toKebabCase(name)}`;
    } else if (name.includes("huge interval")) {
      const match = name.match(/(\d+)/);
      cssName = match
        ? `--spacing-huge-${match[1]}`
        : `--spacing-${toKebabCase(name)}`;
    } else {
      cssName = `--spacing-${toKebabCase(name)}`;
    }

    const cssValue = value === 0 ? "0" : `${value / 16}rem`;

    // Avoid duplicates
    if (!variables.has(cssName)) {
      variables.set(cssName, cssValue);

      if (value === 0) {
        categories.zero.push({ name: cssName, value: cssValue });
      } else if (name.includes("micro")) {
        categories.micro.push({
          name: cssName,
          value: cssValue,
          numValue: value,
        });
      } else if (name.includes("small")) {
        categories.small.push({
          name: cssName,
          value: cssValue,
          numValue: value,
        });
      } else if (name.includes("medium")) {
        categories.medium.push({
          name: cssName,
          value: cssValue,
          numValue: value,
        });
      } else if (name.includes("large")) {
        categories.large.push({
          name: cssName,
          value: cssValue,
          numValue: value,
        });
      } else if (name.includes("huge")) {
        categories.huge.push({
          name: cssName,
          value: cssValue,
          numValue: value,
        });
      }
    }
  });

  let output = "    /* SPACINGS */\n";

  // Sort each category by numeric value
  Object.keys(categories).forEach((category) => {
    if (categories[category].length > 0) {
      categories[category].sort((a, b) => {
        if (a.numValue !== undefined && b.numValue !== undefined) {
          return a.numValue - b.numValue;
        }
        return 0;
      });

      categories[category].forEach((item) => {
        output += `    ${item.name}: ${item.value};\n`;
      });
    }
  });

  return output;
}

/**
 * Process corner radiuses
 */
function processCornerRadiuses(data) {
  const variables = new Map();

  data.variables.forEach((variable) => {
    const name = variable.name.toLowerCase();
    const modeKey = Object.keys(variable.resolvedValuesByMode)[0];
    const value = variable.resolvedValuesByMode[modeKey].resolvedValue;

    // Extract radius name (e.g., "Corner radiuses/radius-1" -> "radius-1")
    let radiusName = name
      .replace(/corner radiuses\//i, "")
      .replace(/radiuses?\//i, "");
    const cssName = `--radius-${toKebabCase(radiusName)}`;
    const cssValue = `${value / 16}rem`;

    if (!variables.has(cssName)) {
      variables.set(cssName, { value: cssValue, numValue: value });
    }
  });

  // Convert to array and sort
  const sorted = Array.from(variables.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => a.numValue - b.numValue);

  let output = "    /* CORNER RADIUSES */\n";
  sorted.forEach((item) => {
    output += `    ${item.name}: ${item.value};\n`;
  });

  return output;
}

/**
 * Process base changable variables
 */
function processBaseVariables(data) {
  const colorVars = new Map();
  const fontVars = new Map();
  const otherVars = new Map();

  data.variables.forEach((variable) => {
    const name = variable.name.toLowerCase();
    const modeKey = Object.keys(variable.resolvedValuesByMode)[0];
    const resolved = variable.resolvedValuesByMode[modeKey];

    if (variable.type === "COLOR" && resolved.resolvedValue) {
      const color = resolved.resolvedValue;
      const hex = rgbToHex(color.r, color.g, color.b, color.a);
      const cssName = `--${processColorVariableName(variable.name)}`;

      // Keep first occurrence if duplicate
      if (!colorVars.has(cssName)) {
        colorVars.set(cssName, hex);
      }
    } else if (variable.type === "FLOAT") {
      const value = resolved.resolvedValue;
      const cssValue = `${value / 16}rem`;

      if (
        name.includes("font") ||
        name.includes("text") ||
        name.includes("size") ||
        name.includes("line-height") ||
        name.includes("height") ||
        name.includes("weight")
      ) {
        const cssName = `--${processFontVariableName(variable.name)}`;
        if (!fontVars.has(cssName)) {
          fontVars.set(cssName, cssValue);
        }
      } else {
        const cssName = `--${toKebabCase(name)}`;
        if (!otherVars.has(cssName)) {
          otherVars.set(cssName, cssValue);
        }
      }
    } else if (variable.type === "STRING") {
      // Handle font weights
      if (name.includes("weight") || name.includes("font weight")) {
        const weightValue = fontWeightToNumber(resolved.resolvedValue);
        const cssName = `--${processFontVariableName(variable.name)}`;
        if (!fontVars.has(cssName)) {
          fontVars.set(cssName, weightValue.toString());
        }
      }
    }
  });

  // Group colors
  const colorGroups = {
    primary: [],
    secondary: [],
    state: [],
    action: [],
    text: [],
    background: [],
    common: [],
    error: [],
    warning: [],
    success: [],
    info: [],
    os: [],
    other: [],
  };

  colorVars.forEach((value, name) => {
    const nameLower = name.toLowerCase();
    if (
      nameLower.includes("primary") &&
      !nameLower.includes("state") &&
      !nameLower.includes("opacity")
    ) {
      colorGroups.primary.push({ name, value });
    } else if (
      nameLower.includes("secondary") &&
      !nameLower.includes("state") &&
      !nameLower.includes("opacity")
    ) {
      colorGroups.secondary.push({ name, value });
    } else if (
      nameLower.includes("state") ||
      nameLower.includes("hover") ||
      nameLower.includes("selected") ||
      nameLower.includes("50")
    ) {
      colorGroups.state.push({ name, value });
    } else if (nameLower.includes("action")) {
      colorGroups.action.push({ name, value });
    } else if (nameLower.includes("text")) {
      colorGroups.text.push({ name, value });
    } else if (nameLower.includes("background") || nameLower.includes("bg")) {
      colorGroups.background.push({ name, value });
    } else if (nameLower.includes("common")) {
      colorGroups.common.push({ name, value });
    } else if (nameLower.includes("error")) {
      colorGroups.error.push({ name, value });
    } else if (nameLower.includes("warning")) {
      colorGroups.warning.push({ name, value });
    } else if (nameLower.includes("success")) {
      colorGroups.success.push({ name, value });
    } else if (nameLower.includes("info")) {
      colorGroups.info.push({ name, value });
    } else if (nameLower.includes("os-")) {
      colorGroups.os.push({ name, value });
    } else {
      colorGroups.other.push({ name, value });
    }
  });

  let output = "";

  // Output fonts
  if (fontVars.size > 0) {
    output += "    /* FONTS */\n";
    const sortedFonts = Array.from(fontVars.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    sortedFonts.forEach((item) => {
      output += `    ${item.name}: ${item.value};\n`;
    });
    output += "\n";
  }

  // Output colors grouped
  if (colorVars.size > 0) {
    output += "    /* COLORS */\n";

    const groups = [
      "primary",
      "secondary",
      "state",
      "action",
      "text",
      "background",
      "common",
      "error",
      "warning",
      "success",
      "info",
      "os",
      "other",
    ];
    groups.forEach((group) => {
      if (colorGroups[group].length > 0) {
        colorGroups[group].forEach((item) => {
          output += `    ${item.name}: ${item.value};\n`;
        });
      }
    });

    output += "\n";
  }

  // Output other variables
  if (otherVars.size > 0) {
    output += "    /* OTHER VARIABLES */\n";
    Array.from(otherVars.entries()).forEach(([name, value]) => {
      output += `    ${name}: ${value};\n`;
    });
  }

  return output;
}

/**
 * Process additional colors
 */
function processAdditionalColors(data) {
  const variables = new Map();

  data.variables.forEach((variable) => {
    const name = variable.name.toLowerCase();
    const modeKey = Object.keys(variable.resolvedValuesByMode)[0];
    const resolved = variable.resolvedValuesByMode[modeKey];

    if (variable.type === "COLOR" && resolved.resolvedValue) {
      const color = resolved.resolvedValue;
      const hex = rgbToHex(color.r, color.g, color.b, color.a);
      const cssName = `--color-additional-${toKebabCase(name)}`;

      if (!variables.has(cssName)) {
        variables.set(cssName, hex);
      }
    }
  });

  let output = "    /* ADDITIONAL COLORS */\n";
  Array.from(variables.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([name, value]) => {
      output += `    ${name}: ${value};\n`;
    });

  return output;
}

/**
 * Process material palette
 */
function processMaterialPalette(data) {
  const variables = new Map();

  data.variables.forEach((variable) => {
    const name = variable.name.toLowerCase();
    const modeKey = Object.keys(variable.resolvedValuesByMode)[0];
    const resolved = variable.resolvedValuesByMode[modeKey];

    if (variable.type === "COLOR" && resolved.resolvedValue) {
      const color = resolved.resolvedValue;
      const hex = rgbToHex(color.r, color.g, color.b, color.a);

      // Convert "Material Palette/blue/500" to "color-material-blue-500"
      const parts = name.split("/");
      let cssName = "";

      if (parts.length >= 3) {
        const colorName = parts[1];
        const shade = parts[2];
        cssName = `--color-material-${colorName}-${shade}`;
      } else if (parts.length === 2) {
        const colorName = parts[1];
        cssName = `--color-material-${colorName}`;
      } else {
        cssName = `--color-material-${toKebabCase(name)}`;
      }

      if (!variables.has(cssName)) {
        variables.set(cssName, hex);
      }
    }
  });

  let output = "    /* MATERIAL PALETTE */\n";
  Array.from(variables.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([name, value]) => {
      output += `    ${name}: ${value};\n`;
    });

  return output;
}

/**
 * Process component variables
 */
function processComponentVariables(data) {
  const componentGroups = new Map();

  data.variables.forEach((variable) => {
    const name = variable.name.toLowerCase();
    const modeKey = Object.keys(variable.resolvedValuesByMode)[0];
    const resolved = variable.resolvedValuesByMode[modeKey];

    // Extract component name (e.g., "Button/large/font size" -> "button")
    const parts = name.split("/");
    const component =
      parts.length > 0 ? parts[0].replace(/s$/, "").toLowerCase() : "other";

    if (!componentGroups.has(component)) {
      componentGroups.set(component, new Map());
    }

    const componentVars = componentGroups.get(component);
    let cssName = "";
    let cssValue = "";

    if (variable.type === "COLOR" && resolved.resolvedValue) {
      const color = resolved.resolvedValue;
      cssValue = rgbToHex(color.r, color.g, color.b, color.a);
      cssName = `--color-${toKebabCase(name)}`;
    } else if (variable.type === "FLOAT") {
      const value = resolved.resolvedValue;
      cssValue = `${value / 16}rem`;

      const size = parts.length > 1 ? parts[1].toLowerCase() : "default";
      const prop = parts.length > 2 ? parts[2].toLowerCase() : "";

      if (prop.includes("font size")) {
        cssName = `--text-${component}-${size}-size`;
      } else if (prop.includes("font height") || prop.includes("line height")) {
        cssName = `--text-${component}-${size}--line-height`;
      } else if (prop.includes("font weight")) {
        cssName = `--text-${component}-${size}--font-weight`;
      } else if (prop.includes("vertical padding")) {
        cssName = `--spacing-${component}-${size}-vertical-padding`;
      } else if (prop.includes("horizontal padding")) {
        cssName = `--spacing-${component}-${size}-horizontal-padding`;
      } else if (prop.includes("border radius")) {
        cssName = `--radius-${component}-${size}`;
      } else {
        cssName = `--${toKebabCase(name)}`;
      }
    } else if (variable.type === "STRING") {
      if (name.includes("font weight") || name.includes("weight")) {
        const weightValue = fontWeightToNumber(resolved.resolvedValue);
        cssValue = weightValue.toString();
        const size = parts.length > 1 ? parts[1].toLowerCase() : "default";
        cssName = `--text-${component}-${size}--font-weight`;
      }
    }

    if (cssName && cssValue && !componentVars.has(cssName)) {
      componentVars.set(cssName, cssValue);
    }
  });

  let output = "    /* COMPONENTS */\n";

  // Output by component
  Array.from(componentGroups.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([component, vars]) => {
      if (vars.size > 0) {
        output += `    /* ${component.charAt(0).toUpperCase() + component.slice(1)} */\n`;
        Array.from(vars.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([name, value]) => {
            output += `    ${name}: ${value};\n`;
          });
        output += "\n";
      }
    });

  return output;
}

/**
 * Main conversion function
 */
function convertFigmaVars() {
  const designSystemPath = path.join(
    __dirname,
    "../public/assets/figma-design-system"
  );
  const outputPath = path.join(__dirname, "../src/styles/vars.css");

  let cssOutput = "@layer base {\n  :root {\n";

  // Process files in order
  const files = [
    { name: "1. Spacings.json", processor: processSpacings },
    { name: "2. Corner radiuses.json", processor: processCornerRadiuses },
    {
      name: "⭐️ 3. Base changable variables.json",
      processor: processBaseVariables,
    },
    {
      name: "⭐️ 4.Additional colors.json",
      processor: processAdditionalColors,
    },
    { name: "5. Material Palette.json", processor: processMaterialPalette },
    {
      name: "6.Components variables.json",
      processor: processComponentVariables,
    },
  ];

  files.forEach((file) => {
    const filePath = path.join(designSystemPath, file.name);
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${file.name}...`);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const result = file.processor(data);
        if (result.trim()) {
          cssOutput += "\n" + result;
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error.message);
      }
    } else {
      console.warn(`File not found: ${file.name}`);
    }
  });

  cssOutput += "  }\n}\n";

  fs.writeFileSync(outputPath, cssOutput);
  console.log(`\n✅ CSS variables written to ${outputPath}`);
}

// Run the conversion
convertFigmaVars();
