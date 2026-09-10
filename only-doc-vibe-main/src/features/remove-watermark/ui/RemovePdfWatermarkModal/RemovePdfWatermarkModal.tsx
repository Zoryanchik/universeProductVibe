import { useMemo, useState, type FC } from "react";
import { Button, Input } from "@universe-forma/ui-pes";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { useCmsModalContent } from "@/shared/lib/cms-modal-content";
import { BaseModal } from "@/shared/ui/base-modal";

export interface IRemovePdfWatermarkModalOptions {
  filename: string;
  onSubmit: (texts: string[]) => void;
}

export const RemovePdfWatermarkModal: FC = () => {
  const { filename, onSubmit } = useCurrentModalOptions(
    EModalsTypes.REMOVE_PDF_WATERMARK_MODAL
  );
  const cms = useCmsModalContent("modals.remove-watermark-modal");
  const [value, setValue] = useState("");

  const parsedWords = useMemo(
    () =>
      value
        .split(/[\n,]+/g)
        .map((word) => word.trim())
        .filter(Boolean),
    [value]
  );

  const handleSubmit = () => {
    if (parsedWords.length === 0) {
      return;
    }

    onSubmit(parsedWords);
    closeModal(EModalsTypes.REMOVE_PDF_WATERMARK_MODAL);
  };

  return (
    <BaseModal
      modalType={EModalsTypes.REMOVE_PDF_WATERMARK_MODAL}
      canClose
      headerTitle={cms?.title}
      headerSubtitle={cms?.subtitle?.replace("{filename}", filename)}
      className="w-full max-w-[560px]"
      data-testid="remove-watermark-modal"
    >
      <div className="flex flex-col gap-4 px-5 pb-5">
        <Input
          size="lg"
          bg="filled"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={cms?.input_placeholder}
        />
        <div className="text-text-secondary text-sm">{cms?.hint}</div>
        <Button
          variant="filled"
          color="primary"
          onClick={handleSubmit}
          disabled={parsedWords.length === 0}
          data-testid="remove-watermark-modal-submit-button"
        >
          {cms?.submit_button}
        </Button>
      </div>
    </BaseModal>
  );
};
