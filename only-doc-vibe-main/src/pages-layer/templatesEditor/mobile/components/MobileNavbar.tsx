import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { PagesButton } from "../../components/PagesButton";
import { PageNavigation } from "../../components/PageNavigation";
import { ZoomButtons } from "../../components/ZoomButtons";

interface MobileNavbarProps {
  store: StoreType;
  isPagesOpen: boolean;
  onTogglePages: () => void;
}

/** Floating canvas controls (pages toggle, zoom, page navigation) for mobile. */
export const MobileNavbar: FC<MobileNavbarProps> = observer(
  ({ store, isPagesOpen, onTogglePages }) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[5] flex items-end justify-between px-2">
      <div className="pointer-events-auto">
        <PagesButton isOpen={isPagesOpen} onToggle={onTogglePages} />
      </div>
      <div className="pointer-events-auto">
        <ZoomButtons store={store} />
      </div>
      <div className="pointer-events-auto">
        <PageNavigation store={store} />
      </div>
    </div>
  )
);
