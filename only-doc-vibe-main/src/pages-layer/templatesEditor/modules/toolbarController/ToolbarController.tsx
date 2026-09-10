import type { FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useLockElements } from "../../helpers/lockElements";
import { TextToolbar } from "./toolbars/TextToolbar";
import { ImageToolbar } from "./toolbars/imageToolbar/ImageToolbar";
import { SignatureToolbar } from "./toolbars/SignatureToolbar";
import { CommonToolbar } from "./toolbars/CommonToolbar";
import { ShapesToolbar } from "./toolbars/ShapesToolbar";
import { LinesToolbar } from "./toolbars/LinesToolbar";
import { TableToolbar } from "./toolbars/TableToolbar";
import { TableCellToolbar } from "./toolbars/TableCellToolbar";

interface ToolbarControllerProps {
  store: StoreType;
}

export const Toolbars: FC<ToolbarControllerProps> = observer(({ store }) => {
  const elements = store.selectedElements;
  const { isLocked } = useLockElements({ store });

  if (elements.length === 0 || isLocked) return null;

  const hasTextElement =
    elements.length > 0 && elements.every((el) => el.type === "text");

  if (hasTextElement) return <TextToolbar store={store} />;

  const hasSignatureElement =
    elements.length > 0 && elements.every((el) => el.custom?.isSignature);

  if (hasSignatureElement) return <SignatureToolbar store={store} />;

  const hasImageElement =
    elements.length > 0 && elements.every((el) => el.type === "image");

  if (hasImageElement) return <ImageToolbar store={store} />;

  const hasFigureElement =
    elements.length > 0 && elements.every((el) => el.type === "figure");
  const hasSvgElement =
    elements.length > 0 && elements.every((el) => el.type === "svg");

  if (hasFigureElement || hasSvgElement) return <ShapesToolbar store={store} />;

  const hasLineElement =
    elements.length > 0 && elements.every((el) => el.type === "line");

  if (hasLineElement) return <LinesToolbar store={store} />;

  const hasTableElement =
    elements.length > 0 && elements.every((el) => el.type === "table");

  if (hasTableElement) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasFocusedCells = (elements[0] as any)?.focusedCells?.length > 0;
    if (hasFocusedCells) return <TableCellToolbar store={store} />;

    return <TableToolbar store={store} />;
  }

  return <CommonToolbar store={store} />;
});

export const ToolbarController: FC<ToolbarControllerProps> = observer(
  ({ store }) => {
    return (
      <div className="relative z-10 h-[60px] min-h-[60px] w-full">
        <Toolbars store={store} />
      </div>
    );
  }
);
