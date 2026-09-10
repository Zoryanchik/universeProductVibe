import type { FC } from "react";
import type { StoreType } from "polotno/model/store";

import { BasicTextSection } from "./sections/BasicText";
import { TextPresetsSection } from "./sections/TextPresets";

interface BasicTextTabProps {
  store: StoreType;
}

export const BasicTextTab: FC<BasicTextTabProps> = ({ store }) => {
  return (
    <>
      <BasicTextSection store={store} />
      <TextPresetsSection store={store} />
    </>
  );
};
