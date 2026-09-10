export interface IRevealEmailModalOptions {
  /** Callback to execute after successful reveal (e.g., download file) */
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
