import { useRef, type FC, type ReactNode } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { useLockElements } from "../../helpers/lockElements";
import { IconButton } from "../../ui/IconButton";
import { Tooltip } from "../../ui/Tooltip";
import { FontFamilyInstrument } from "../../modules/toolbarController/toolbars/common/instruments/FontFamily";
import { FontSizeInstrument } from "../../modules/toolbarController/toolbars/common/instruments/FontSize";
import { TextStyleInstrument } from "../../modules/toolbarController/toolbars/common/instruments/TextStyle";
import { FillColorInstrument } from "../../modules/toolbarController/toolbars/common/instruments/FillColor";
import { TextAlignInstrument } from "../../modules/toolbarController/toolbars/common/instruments/TextAlign";
import { VerticalAlignInstrument } from "../../modules/toolbarController/toolbars/common/instruments/VerticalAlign";
import { FitToPageInstrument } from "../../modules/toolbarController/toolbars/common/instruments/FitToPage";
import { PositionInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Position";
import { CopyStyleInstrument } from "../../modules/toolbarController/toolbars/common/instruments/CopyStyle";
import { FlipInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Flip";
import { CropInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Crop";
import { BorderInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Border";
import { MaskInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Mask";
import { EffectsInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Effects";
import { OpacityInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Opacity";
import { CopyInstrument } from "../../modules/toolbarController/toolbars/common/instruments/Copy";
import { LineStyleInstrument } from "../../modules/toolbarController/toolbars/common/instruments/LineStyle";
import { LineHeadInstrument } from "../../modules/toolbarController/toolbars/common/instruments/LineHead";
import { TableBackgroundColorInstrument } from "../../modules/toolbarController/toolbars/common/instruments/TableBackgroundColor";
import { TableBorderInstrument } from "../../modules/toolbarController/toolbars/common/instruments/TableBorder";
import { TableStructureInstrument } from "../../modules/toolbarController/toolbars/common/instruments/TableStructure";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface MobileContextualBarProps {
  store: StoreType;
}

const DoneButton: FC<{ store: StoreType }> = ({ store }) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t("templatesEditor.ui.done") as string}>
      <IconButton iconName="check" onClick={() => store.selectElements([])} />
    </Tooltip>
  );
};

const Card: FC<{ store: StoreType; children: ReactNode }> = ({
  store,
  children,
}) => (
  <nav className="shrink-0 px-2 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
    <div className="mx-auto flex w-max max-w-full items-stretch rounded-[20px] bg-[var(--color-bg-white-bg)] shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
      <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto p-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 border-s border-black/[0.08] p-2">
        <DoneButton store={store} />
      </div>
    </div>
  </nav>
);

const TextBar: FC<{ store: StoreType }> = observer(({ store }) => {
  const { t } = useTranslation();

  return (
    <Card store={store}>
      <FontFamilyInstrument store={store} width={124} placement="top" />
      <FontSizeInstrument store={store} width={72} placement="top" />
      <TextStyleInstrument store={store} />
      <FillColorInstrument
        store={store}
        colorProperty="fill"
        iconName="format_color_text"
        tooltipContent={t("templatesEditor.toolbar.text_color") as string}
      />
      <TextAlignInstrument store={store} />
      <VerticalAlignInstrument store={store} />
      <FitToPageInstrument store={store} />
      <OpacityInstrument store={store} />
      <EffectsInstrument sidePanel="text" />
      <PositionInstrument store={store} />
      <CopyInstrument store={store} />
      <CopyStyleInstrument store={store} />
    </Card>
  );
});

const PhotoBar: FC<{ store: StoreType }> = observer(({ store }) => (
  <Card store={store}>
    <FlipInstrument store={store} />
    <FitToPageInstrument store={store} />
    <MaskInstrument />
    <CropInstrument store={store} />
    <BorderInstrument store={store} />
    <OpacityInstrument store={store} />
    <EffectsInstrument sidePanel="photo" />
    <PositionInstrument store={store} />
    <CopyInstrument store={store} />
    <CopyStyleInstrument store={store} />
  </Card>
));

const DrawingBar: FC<{ store: StoreType }> = observer(({ store }) => {
  const { t } = useTranslation();

  return (
    <Card store={store}>
      <FillColorInstrument
        store={store}
        colorProperty="fill"
        iconName="palette"
        tooltipContent={t("templatesEditor.mobile.color") as string}
      />
      <OpacityInstrument store={store} />
      <PositionInstrument store={store} />
      <CopyInstrument store={store} />
    </Card>
  );
});

const ShapesBar: FC<{ store: StoreType; isSVG: boolean }> = observer(
  ({ store, isSVG }) => (
    <Card store={store}>
      <FillColorInstrument store={store} />
      <OpacityInstrument store={store} />
      <EffectsInstrument sidePanel={isSVG ? "photo" : "shapes"} />
      <BorderInstrument store={store} />
      <CopyInstrument store={store} />
    </Card>
  )
);

const LinesBar: FC<{ store: StoreType }> = observer(({ store }) => {
  const { t } = useTranslation();

  return (
    <Card store={store}>
      <FillColorInstrument store={store} colorProperty="color" />
      <LineStyleInstrument store={store} />
      <LineHeadInstrument
        store={store}
        property="startHead"
        iconName="arrow_back"
        tooltipContent={t("templatesEditor.toolbar.line_start") as string}
      />
      <CopyInstrument store={store} />
    </Card>
  );
});

const TableBar: FC<{ store: StoreType }> = observer(({ store }) => (
  <Card store={store}>
    <TableBackgroundColorInstrument store={store} />
    <TableBorderInstrument store={store} />
    <TableStructureInstrument store={store} />
    <CopyInstrument store={store} />
  </Card>
));

const TableCellBar: FC<{ store: StoreType }> = observer(({ store }) => {
  const { t } = useTranslation();
  const table = (store.selectedElements as unknown as AnyElement[])[0];
  const focusedCellsRef = useRef<AnyElement[]>([]);

  const liveFocused: AnyElement[] = table?.focusedCells ?? [];
  if (liveFocused.length > 0) {
    focusedCellsRef.current = liveFocused;
  }

  const cellElements = focusedCellsRef.current;

  return (
    <Card store={store}>
      <FontFamilyInstrument
        store={store}
        elements={cellElements}
        width={124}
        placement="top"
      />
      <FontSizeInstrument
        store={store}
        elements={cellElements}
        editable={false}
        width={72}
        placement="top"
      />
      <TextStyleInstrument store={store} elements={cellElements} />
      <FillColorInstrument
        store={store}
        colorProperty="fill"
        iconName="format_color_text"
        tooltipContent={t("templatesEditor.toolbar.text_color") as string}
        elements={cellElements}
      />
      <TextAlignInstrument store={store} elements={cellElements} />
      <VerticalAlignInstrument store={store} elements={cellElements} />
      <TableBackgroundColorInstrument store={store} />
      <TableBorderInstrument store={store} />
      <TableStructureInstrument store={store} isTableCell />
      <CopyInstrument store={store} />
    </Card>
  );
});

const SignatureBar: FC<{ store: StoreType }> = observer(({ store }) => (
  <Card store={store}>
    <FillColorInstrument store={store} />
    <PositionInstrument store={store} />
    <CopyInstrument store={store} />
  </Card>
));

const CommonBar: FC<{ store: StoreType }> = observer(({ store }) => (
  <Card store={store}>
    <OpacityInstrument store={store} />
    <PositionInstrument store={store} />
    <CopyInstrument store={store} />
  </Card>
));

/**
 * Selection toolbar for mobile: a horizontally scrollable card of instruments
 * tailored to the selected element type, with a pinned "Done" (deselect) button.
 * The instrument popovers auto-flip upward near the viewport bottom so they stay
 * on-screen above this bottom-anchored bar.
 */
export const MobileContextualBar: FC<MobileContextualBarProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const elements = store.selectedElements as unknown as AnyElement[];
    const { isLocked } = useLockElements({ store });

    if (elements.length === 0) return null;

    if (isLocked) {
      return (
        <nav className="shrink-0 px-2 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-max max-w-full items-center gap-1.5 rounded-[20px] bg-[var(--color-bg-white-bg)] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            <Tooltip content={t("templatesEditor.ui.done") as string}>
              <IconButton
                iconName="check"
                onClick={() => store.selectElements([])}
              />
            </Tooltip>
          </div>
        </nav>
      );
    }

    const every = (pred: (el: AnyElement) => boolean) => elements.every(pred);

    if (every((el) => el.type === "text")) return <TextBar store={store} />;

    if (every((el) => Boolean(el.custom?.isDrawing)))
      return <DrawingBar store={store} />;

    if (every((el) => Boolean(el.custom?.isSignature)))
      return <SignatureBar store={store} />;

    if (every((el) => el.type === "image")) return <PhotoBar store={store} />;

    if (every((el) => el.type === "figure" || el.type === "svg")) {
      return (
        <ShapesBar store={store} isSVG={every((el) => el.type === "svg")} />
      );
    }

    if (every((el) => el.type === "line")) return <LinesBar store={store} />;

    if (every((el) => el.type === "table")) {
      const table = elements[0];
      const hasFocusedCells = (table?.focusedCells?.length ?? 0) > 0;

      return hasFocusedCells ? (
        <TableCellBar store={store} />
      ) : (
        <TableBar store={store} />
      );
    }

    return <CommonBar store={store} />;
  }
);
