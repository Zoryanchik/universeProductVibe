export enum EAnalyticsEvents {
  // Page views
  MAIN_PAGE_VIEW = "main_page_view",
  CONTACT_US_PAGE_VIEW = "contact_us_page_view",
  LOG_IN_PAGE_VIEW = "log_in_page_view",
  SIGN_UP_PAGE_VIEW = "sign_up_page_view",
  CONVERSION_TOOLS_PAGE_VIEW = "conversion_tools_page_view",

  // Navigation / Navbar
  LOGO_TAP = "logo_tap",
  LANDING_LANGUAGE_TAP = "landing_language_tap",
  CHANGE_LANGUAGE_TAP = "change_language_tap",
  CATEGORIES_BAR_TAP = "categories_bar_tap",
  LANDING_FEATURES_TAP = "landing_features_tap",
  TOOLS_TAP = "tools_tap",
  CONVERT_PAGE_TAP = "convert_page_tap",
  CONTACT_US_TAP = "contact_us_tap",
  LOG_IN_TAP = "log_in_tap",

  // Upload / file flow
  FEATURES_TAP = "features_tap",
  FEATURES_TAP_DND = "features_tap_dnd",
  FEATURES_TAP_CANCEL = "features_tap_cancel",
  FILE_UPLOAD_STATUS = "file_upload_status",

  // Footer / Trust
  FOOTER_TAP = "footer_tap",
  TRUST_PILOT_TAP = "trust_pilot_tap",
  FAQ_OPEN_TAP = "faq_open_tap",

  // Contact Us form
  FORM_SUBMIT = "form_submit",
  FORM_SUBMISSION_STATUS = "form_submission_status",

  // Auth — Log In
  REMEMBER_ME_TAP = "remember_me_tap",
  FORGOT_PASSWORD_TAP = "forgot_password_tap",
  RECOVER_PASS_MODAL_VIEW = "recover_pass_modal_view",
  RECOVER_PASS_CONFIRM_TAP = "recover_pass_confirm_tap",
  SIGN_UP_TAP = "sign_up_tap",

  // Auth — Sign Up
  SIGN_UP_CONFIRM_TAP = "sign_up_confirm_tap",
  TERMS_OF_USE_TAP = "terms_of_use_tap",
  EMAIL_ENTER_TAP = "email_enter_tap",
  EMAIL_ENTER_ERROR = "email_enter_error",
  EMAIL_VALIDATION = "email_validation",

  // AI Summarizer
  SUMMARIZER_PAGE_VIEW = "summarizer_page_view",
  SUMMARIZER_UPLOAD_TAP = "summarizer_upload_file_tap",
  SUMMARIZER_START_CHAT = "summarizer_start_chat",
  SUMMARIZER_CHAT_READY = "summarizer_chat_ready",
  SUMMARIZER_CHAT_FAILED = "summarizer_chat_failed",
  SUMMARIZER_SEND_PROMPT = "summarizer_send_prompt",
  SUMMARIZER_START_PROMPT = "summarizer_start_prompt",
  SUMMARIZER_SUGGESTED_QUESTION_TAP = "summarizer_suggested_question_tap",
  SUMMARIZER_VIEW_CHAT_TAP = "summarizer_view_chat_tap",
  SUMMARIZER_DELETE_CHAT_TAP = "summarizer_delete_chat_tap",
}

export type AnalyticsEventName = `${EAnalyticsEvents}`;

type AnalyticsPrimitive = string | number | boolean | null | undefined;

export type AnalyticsEventProperties = Record<
  string,
  AnalyticsPrimitive | AnalyticsPrimitive[]
>;
