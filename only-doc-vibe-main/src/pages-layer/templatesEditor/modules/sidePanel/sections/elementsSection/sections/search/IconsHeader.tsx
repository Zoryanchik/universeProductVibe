import type { FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../../../ui/SidePanelSectionLabel";

interface IconsHeaderProps {
  isEmptySearch: boolean;
}

const IconsHeader: FC<IconsHeaderProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full justify-between">
      <SidePanelSectionLabel
        label={t("templatesEditor.side_panel.headers.icons") as string}
        type="sub-header"
      />
      <SidePanelSectionLabel
        label={t("templatesEditor.side_panel.headers.icons_count") as string}
        type="sub-header"
        align="right"
      />
    </div>
  );
};

export default IconsHeader;
