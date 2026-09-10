import type { ComponentProps, FC } from "react";

import type { ELanguages } from "../../constants/languages";
import { getCurrentLanguage } from "../../lib/translations/getCurrentLanguage";
import { getLocalizedPath } from "../../lib/navigation/getLocalizedPath";

interface IProps extends ComponentProps<"a"> {
  locale?: ELanguages;
}

export const AppLink: FC<IProps> = ({ href, children, locale, ...props }) => {
  const currentLanguage = locale || getCurrentLanguage();
  const path = getLocalizedPath(href!, currentLanguage);

  return (
    <a href={path} {...props}>
      {children}
    </a>
  );
};
