import { useRef, type FC } from "react";
import { Button } from "@universe-forma/ui-pes";
import NoFilesIllustration from "@public/assets/illustrations/drawing.svg?url";

import { useTranslation } from "@/shared/lib/translations";
import { UploadIcon } from "@/shared/ui/dashboard-icons";

import { useDashboardUpload } from "@/features/dashboard-upload";

export const EmptyState: FC = () => {
  const { t } = useTranslation();
  const { upload, inFlight } = useDashboardUpload();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="bg-bg-white-bg flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl py-16 text-center">
      <img
        src={NoFilesIllustration}
        alt=""
        aria-hidden
        draggable={false}
        className="h-[182px] w-auto"
      />
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary text-xl leading-6 font-semibold">
          {String(t("dashboard.empty.title"))}
        </h3>
        <p className="text-text-secondary text-base leading-[22px]">
          {String(t("dashboard.empty.subtitle"))}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;

          void upload(Array.from(files));
          e.target.value = "";
        }}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={inFlight > 0}
        className="flex w-[180px] items-center justify-center gap-1.5"
      >
        <UploadIcon size={18} />
        {String(t("dashboard.empty.cta"))}
      </Button>
    </div>
  );
};
