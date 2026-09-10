import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import RightGroup from "./common/RightGroup";
import { LeftGroup } from "./common/leftGroup/LeftGroup";

interface CommonToolbarProps {
  store: StoreType;
}

export const CommonToolbar: FC<CommonToolbarProps> = observer(({ store }) => {
  return (
    <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <LeftGroup store={store} />
      <RightGroup store={store} />
    </div>
  );
});
