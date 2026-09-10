import type { FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { ToolButton } from "../ui/ToolButton";

interface HistoryButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const HistoryButtons: FC<HistoryButtonsProps> = ({
  canUndo,
  canRedo,
  undo,
  redo,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {(canUndo || canRedo) && (
        <ToolButton
          icon="undo"
          label={t("templatesEditor.ui.undo") as string}
          onClick={undo}
          disabled={!canUndo}
        />
      )}

      {(canRedo || canUndo) && (
        <ToolButton
          icon="redo"
          label={t("templatesEditor.ui.redo") as string}
          onClick={redo}
          disabled={!canRedo}
        />
      )}
    </>
  );
};

export default HistoryButtons;
