import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { DeleteInstrument } from "./instruments/Delete";
import { LockInstrument } from "./instruments/Lock";

interface CommonRightGroupProps {
  store: StoreType;
}

const CommonRightGroup: FC<CommonRightGroupProps> = observer(({ store }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="mx-1 w-px self-stretch bg-[var(--color-action-stroke)]" />
      <LockInstrument store={store} />
      <DeleteInstrument store={store} />
    </div>
  );
});

export default CommonRightGroup;
