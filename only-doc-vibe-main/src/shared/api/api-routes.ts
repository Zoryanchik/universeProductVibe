export const API_ROUTES = {
  AI_SUMMARIZER_INITIALIZE: "/ai-summarizer/initialize",
  AI_SUMMARIZER_CONVERSATIONS: "/ai-summarizer/conversations",
  AI_SUMMARIZER_CONVERSATION: (chatId: string) => `/ai-summarizer/${chatId}`,
  AI_SUMMARIZER_MESSAGES: (chatId: string) =>
    `/ai-summarizer/${chatId}/messages`,

  UPLOAD_LINK: "/files/upload-link",
  FILE_DOWNLOAD: (fileId: string) => `/files/download/${fileId}`,
  FILE_STATUS: (fileId: string) => `/files/status/${fileId}`,
  FILE_OPTIMIZED: (fileId: string) => `/files/${fileId}/optimized`,
  FILE_CONVERTED: (fileId: string) => `/files/${fileId}/converted`,
  FILE_OCRED: (fileId: string) => `/files/${fileId}/ocred`,

  EDITOR_FILE_UPLOAD: "/editor/file-uploaded",
  CONVERT_FILE_UPLOAD: "/converter/file-uploaded",
  COMPRESS_FILE_UPLOAD: "/optimize/file-uploaded",
  OCR_FILE_UPLOAD: "/ocr/file-uploaded",
  TRANSLATE_FILE_UPLOAD: "/translate/file-uploaded",
  REMOVE_WATERMARK_UPLOAD: "/remove-watermark/file-uploaded",
  UNLOCK_FILE_UPLOAD: "/unlock/file-uploaded",
  ENHANCE_IMAGE_UPLOAD: "/enhance-image/file-uploaded",

  USER_ME: "/user/me",
  USER_CREATE_ANONYMOUS: "/user/create",
  USER_COUNTRY: "/user/country",
  USER_REVEAL: "/user/reveal", // Email-only signup (password auto-generated)
  USER_CHANGE_LOCALE: "/user/change-locale",

  AUTH_LOGOUT: "/auth/logout",
  AUTH_LOGIN: "/auth/login/session",
  AUTH_RECOVER_PASSWORD: "/auth/recover-password-request",
  AUTH_SIGN_UP: "/auth/signup-with-email",
  AUTH_ANONYMOUS_SESSION: "/auth/anonymous/session",
  AUTH_GOOGLE_DEFAULT: "/auth/google/default",
  AUTH_VALIDATE_RECOVERY_PASSWORD_TOKEN:
    "/auth/validate-recovery-password-token",
  AUTH_RECOVER_PASSWORD_CONFIRMATION: "/auth/recover-password-confirmation",

  CONTACT_US: "/contact-us",

  // Dashboard / user files
  FILES_LIST: "/files",
  FILE_DELETE: (id: string) => `/files/${id}`,
  FILE_RENAME: (id: string) => `/files/${id}/rename`,
  FILE_DUPLICATE: (id: string) => `/files/${id}/duplicate`,
  FILE_SHARE_LINK: (id: string) => `/files/${id}/share-link`,
  FILE_SHARE_EMAIL: "/files/share-via-email",
  FILES_BULK_DELETE: "/files/bulk-delete",
  FILE_UPLOADED: "/files",

  // Products
  PRODUCTS: "/products",
  RECURRENT_ONE_TIME_PAYMENT: "/payment/recurrent/one-time",
};
