import {
  cloneElement,
  createElement,
  type FC,
  isValidElement,
  type ReactNode,
} from "react";

import { useTranslation } from "./useTranslation";

interface IProps {
  i18nKey: string;
  components?: Record<string, ReactNode>;
  values?: Record<string, string | number>;
}

export const Trans: FC<IProps> = ({ i18nKey, components, values }) => {
  const { t } = useTranslation();

  const stripNumericSuffix = (tag: string) => tag.replace(/\d+$/, "");

  const createElementForTag = (
    tagName: string,
    children: ReactNode[]
  ): ReactNode => {
    const providedComponent =
      components?.[tagName] ?? components?.[stripNumericSuffix(tagName)];

    if (providedComponent && isValidElement(providedComponent)) {
      // Preserve existing props on provided element and inject children
      return cloneElement(
        providedComponent,
        providedComponent.props as Partial<unknown>,
        children.length <= 1 ? children[0] : children
      );
    }

    const baseTag = stripNumericSuffix(tagName);

    if (baseTag.toLowerCase() === "br") {
      return <br />;
    }

    // Allow a small set of safe default tags; otherwise, just render children
    const allowedTags = new Set(["span", "strong", "a"]);

    if (allowedTags.has(baseTag)) {
      return createElement(baseTag, undefined, children);
    }

    // Unknown tag: render only children (acts like a fragment)
    return children.length <= 1 ? children[0] : children;
  };

  const renderWithTags = (text: string): ReactNode => {
    // Tokenize by tags like <tag>, </tag>, <tag/>, <tag />
    const tagRegex = /<[^>]+>/g;
    const root: { tag: string; children: ReactNode[] } = {
      tag: "__root__",
      children: [],
    };
    const stack: Array<{ tag: string; children: ReactNode[] }> = [root];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushText = (segment: string) => {
      if (!segment) return;

      stack[stack.length - 1].children.push(segment);
    };

    const parseTagToken = (
      raw: string
    ): { type: "open" | "close" | "self"; name: string } | null => {
      const inner = raw.slice(1, -1).trim();
      if (!inner) return null;

      if (inner.startsWith("/")) {
        return { type: "close", name: inner.slice(1).trim() };
      }

      const selfClosing = inner.endsWith("/");
      const name = inner.replace(/\/$/, "").trim().split(/\s+/)[0] || "";

      return { type: selfClosing ? "self" : "open", name };
    };

    while ((match = tagRegex.exec(text)) !== null) {
      const [full] = match;
      const index = match.index;

      pushText(text.slice(lastIndex, index));

      const tagInfo = parseTagToken(full);
      if (tagInfo) {
        if (tagInfo.type === "self") {
          stack[stack.length - 1].children.push(
            createElementForTag(tagInfo.name, [])
          );
        } else if (tagInfo.type === "open") {
          stack.push({ tag: tagInfo.name, children: [] });
        } else {
          // close tag
          // find the last matching open if mismatched
          let i = stack.length - 1;
          while (i > 0 && stack[i].tag !== tagInfo.name) i--;
          if (i > 0) {
            //eslint-disable-next-line
            while (stack.length - 1 >= i) {
              const node = stack.pop()!;
              const element = createElementForTag(node.tag, node.children);
              stack[stack.length - 1].children.push(element);
            }
          } else {
            // no matching open tag found; treat as text
            pushText(full);
          }
        }
      } else {
        pushText(full);
      }

      lastIndex = index + full.length;
    }

    pushText(text.slice(lastIndex));

    // Close any remaining open tags
    while (stack.length > 1) {
      const node = stack.pop()!;
      const element = createElementForTag(node.tag, node.children);
      stack[stack.length - 1].children.push(element);
    }

    const resultChildren = root.children;

    return resultChildren.length <= 1 ? (
      resultChildren[0]
    ) : (
      <>{resultChildren}</>
    );
  };

  const translated = t(i18nKey, values);

  // Trans component expects string translations, not objects
  if (typeof translated !== "string") {
    console.error(
      `Trans component received non-string translation for key "${i18nKey}". Expected string, got:`,
      typeof translated
    );

    return <>{i18nKey}</>;
  }

  return <>{renderWithTags(translated)}</>;
};
