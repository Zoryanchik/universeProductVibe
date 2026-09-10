import { useCallback } from "react";

import { openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";

import type { IRevealEmailModalOptions } from "../model/types";

interface UseOpenRevealModalOptions {
  /** Callback to execute after successful reveal */
  onSuccess?: () => void;
  /** Callback to execute if user closes the modal */
  onClose?: () => void;
  /** Last uploaded filename for analytics/email */
  lastUploadedFilename?: string;
  /** Last uploaded file size for analytics/email */
  lastUploadedFileSize?: number;
  /** Current funnel name for analytics */
  funnel?: string;
  /** Whether to keep modal open after success */
  keepOpenedOnSuccess?: boolean;
  /** Whether user can close the modal */
  canClose?: boolean;
}

/**
 * Hook to easily open the reveal email modal.
 * Use this when you need to show the email-only signup modal in a funnel flow.
 *
 * @example
 * ```tsx
 * const openRevealModal = useOpenRevealModal();
 *
 * // After file processing completes
 * openRevealModal({
 *   funnel: "compress-pdf",
 *   lastUploadedFilename: file.name,
 *   lastUploadedFileSize: file.size,
 *   onSuccess: () => {
 *     // Download the file
 *     downloadFile(fileId);
 *   }
 * });
 * ```
 */
export const useOpenRevealModal = (): ((
  options?: UseOpenRevealModalOptions
) => void) => {
  return useCallback((options?: UseOpenRevealModalOptions) => {
    openModal({
      type: EModalsTypes.REVEAL_EMAIL_MODAL,
      options: options as IRevealEmailModalOptions,
    });
  }, []);
};
