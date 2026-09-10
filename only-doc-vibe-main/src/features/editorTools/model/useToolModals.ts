import { useCallback, useState } from "react";

export type ToolModalId =
  | "watermark"
  | "signature"
  | "qrcode"
  | "barcode"
  | "material"
  | null;

export const useToolModals = () => {
  const [openModal, setOpenModal] = useState<ToolModalId>(null);

  const open = useCallback(
    (id: Exclude<ToolModalId, null>) => setOpenModal(id),
    []
  );
  const close = useCallback(() => setOpenModal(null), []);

  return { openModal, open, close };
};
