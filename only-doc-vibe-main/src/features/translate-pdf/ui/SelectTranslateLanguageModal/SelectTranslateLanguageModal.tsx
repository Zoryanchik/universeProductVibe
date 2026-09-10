import { useMemo, useState, type FC } from "react";
import { Button } from "@universe-forma/ui-pes";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import { useCurrentModalOptions } from "@/shared/lib/modals/modals-store";
import { useCmsModalContent } from "@/shared/lib/cms-modal-content";
import { BaseModal } from "@/shared/ui/base-modal";
import { ELanguages } from "@/shared/constants/languages";

import { buildCmsLanguages } from "../../lib/build-cms-languages";
import { LanguageDropdown } from "./LanguageDropdown";

export interface ISelectTranslateLanguageModalOptions {
  detectedSourceLanguage: ELanguages | null;
  suggestedTargetLanguage: ELanguages | null;
  onSubmit: (options: {
    sourceLanguage: ELanguages;
    targetLanguage: ELanguages;
  }) => void;
}

export const SelectTranslateLanguageModal: FC = () => {
  const cms = useCmsModalContent("modals.translate-modal");
  const { detectedSourceLanguage, suggestedTargetLanguage, onSubmit } =
    useCurrentModalOptions(EModalsTypes.SELECT_TRANSLATE_LANGUAGE);

  const languages = useMemo(
    () => buildCmsLanguages(cms?.available_languages),
    [cms?.available_languages]
  );

  const [sourceLanguage, setSourceLanguage] = useState<ELanguages | null>(
    detectedSourceLanguage ?? ELanguages.ENGLISH
  );
  const [targetLanguage, setTargetLanguage] = useState<ELanguages | null>(
    suggestedTargetLanguage
  );

  const handleSubmit = () => {
    if (!sourceLanguage || !targetLanguage) return;

    onSubmit({ sourceLanguage, targetLanguage });
  };

  const isSubmitDisabled = !sourceLanguage || !targetLanguage;

  return (
    <BaseModal
      headerTitle={cms?.title}
      canClose
      rootClassName="max-md:items-end"
      className="flex w-full max-w-[860px] flex-col items-center overflow-visible max-md:mx-0 max-md:max-w-full max-md:rounded-b-none"
      data-testid="select-translate-language-modal"
      modalType={EModalsTypes.SELECT_TRANSLATE_LANGUAGE}
    >
      {/* Mobile drag handle */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 md:hidden">
        <div className="h-1.5 w-10 rounded-full bg-[#e0e0e0]" />
      </div>

      {/* Content */}
      <div className="flex w-full flex-col px-2 max-md:px-4">
        {/* Language selectors - side by side on desktop, stacked on mobile */}
        <div className="flex w-full gap-4 px-10 pt-6 max-md:flex-col max-md:px-0 md:flex-row">
          {/* Source language */}
          <div className="flex-1">
            <LanguageDropdown
              label={cms?.source_label}
              hint={cms?.auto_detected_hint}
              value={sourceLanguage}
              placeholder={cms?.select_source_placeholder}
              searchPlaceholder={cms?.search_placeholder}
              noResultsText={cms?.no_results_text}
              languages={languages}
              onSelect={setSourceLanguage}
              testId="translate-source-language"
            />
          </div>

          {/* Target language */}
          <div className="flex-1">
            <LanguageDropdown
              label={cms?.target_label}
              hint={cms?.auto_suggested_hint}
              value={targetLanguage}
              placeholder={cms?.select_target_placeholder}
              searchPlaceholder={cms?.search_placeholder}
              noResultsText={cms?.no_results_text}
              languages={languages}
              onSelect={setTargetLanguage}
              testId="translate-target-language"
            />
          </div>
        </div>
      </div>

      {/* Submit button - sticky for mobile scroll */}
      <div className="sticky bottom-0 z-10 flex w-full items-center justify-center rounded-b-[20px] bg-white px-6 pt-4 pb-6">
        <Button
          className="h-12 w-full rounded-xl"
          variant="filled"
          color="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          data-testid="translate-submit-button"
        >
          {cms?.submit_button}
        </Button>
      </div>
    </BaseModal>
  );
};
