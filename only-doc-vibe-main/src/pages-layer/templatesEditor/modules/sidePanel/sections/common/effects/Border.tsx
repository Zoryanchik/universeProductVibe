import { type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { BorderControls } from "../../../../../components/BorderControls";

interface BorderEffectProps {
  store: StoreType;
  hideStrokeType?: boolean;
}

export const BorderEffect: FC<BorderEffectProps> = ({
  store,
  hideStrokeType,
}) => {
  return (
    <BorderControls
      store={store}
      mode="effect"
      hideStrokeType={hideStrokeType}
    />
  );
};
