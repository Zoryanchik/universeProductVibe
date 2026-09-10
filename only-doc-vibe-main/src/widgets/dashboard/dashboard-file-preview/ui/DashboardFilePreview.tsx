import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { Button, cn } from "@universe-forma/ui-pes";
import ConvertIconUrl from "@public/assets/icons/dashboard/tool-convert.svg?url";
import OcrIconUrl from "@public/assets/icons/dashboard/tool-ocr.svg?url";
import TranslateIconUrl from "@public/assets/icons/dashboard/tool-translate.svg?url";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import { openModal } from "@/shared/lib/modals/modals-store";
import { useTranslation, getCurrentLanguage } from "@/shared/lib/translations";
import { loadPdfJsLib } from "@/shared/lib/lazy-load/loadPdfJsLib";
import { logger } from "@/shared/lib/utils/logger";
import { InternalFileType } from "@/shared/constants/file-type";
import { useLocalizedHref } from "@/shared/lib/localized-links";
import {
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  PrintIcon,
  RenameIcon,
  ShareIcon,
  TrashIcon,
} from "@/shared/ui/dashboard-icons";

import { getDownloadInfo } from "@/entities/documents";
import {
  formatBytes,
  formatDate,
  getFormatGroupForType,
  setDashboardPreviewFileId,
  useDashboardStore,
  EFormatGroup,
} from "@/entities/documents";

import { useDashboardActions } from "@/features/dashboard-actions";

const PDFPagesPreview: FC<{
  url: string;
  onPagesLoaded: (n: number) => void;
}> = ({ url, onPagesLoaded }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await loadPdfJsLib();
        const doc = await pdfjs.getDocument(url).promise;
        if (cancelled) return;

        onPagesLoaded(doc.numPages);
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";
        const pagesToRender = Math.min(doc.numPages, 5);
        for (let i = 1; i <= pagesToRender; i += 1) {
          if (cancelled) return;

          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.max(container.clientWidth, 100);
          const scale = targetWidth / viewport.width;
          const scaled = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.className =
            "block w-full rounded-lg shadow-[0px_0px_9.622px_3.608px_rgba(0,0,0,0.08)]";
          canvas.width = scaled.width;
          canvas.height = scaled.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport: scaled, canvas })
            .promise;
          if (!cancelled) container.appendChild(canvas);
        }
      } catch (err) {
        logger.error("Failed to render PDF preview", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, onPagesLoaded]);

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-center gap-3"
    />
  );
};

interface QuickAction {
  readonly icon: string;
  readonly labelKey: string;
  readonly url: string;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    icon: ConvertIconUrl,
    labelKey: "dashboard.preview.convert",
    url: "/pdf-to-word",
  },
  {
    icon: TranslateIconUrl,
    labelKey: "dashboard.preview.translate",
    url: "/translate-pdf",
  },
  { icon: OcrIconUrl, labelKey: "dashboard.preview.ocr", url: "/pdf-ocr" },
];

export const DashboardFilePreview: FC = () => {
  const { t } = useTranslation();
  const localizedHref = useLocalizedHref();
  const previewFileId = useDashboardStore.use.previewFileId();
  const files = useDashboardStore.use.files();
  const file = useMemo(
    () => files.find((f) => f.id === previewFileId) ?? null,
    [files, previewFileId]
  );
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const { downloadOne, duplicate, print } = useDashboardActions();

  useEffect(() => {
    if (!file) {
      setUrl(null);
      setTotalPages(null);

      return;
    }

    let cancelled = false;
    setLoading(true);
    setUrl(null);
    setTotalPages(null);
    getDownloadInfo(file.id)
      .then((info) => {
        if (!cancelled) setUrl(info.url);
      })
      .catch((err) => {
        logger.error("Failed to fetch preview URL", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!file) return null;

  const group = getFormatGroupForType(file.internal_type);
  const isPdf = file.internal_type.toUpperCase() === InternalFileType.PDF;
  const isImage = group === EFormatGroup.IMAGE;

  const close = () => setDashboardPreviewFileId(null);

  return (
    <aside
      className={cn(
        "bg-bg-white-bg flex w-[400px] shrink-0 flex-col gap-4 rounded-2xl p-6",
        "shadow-[0px_0px_24px_rgba(0,0,0,0.06)]",
        "max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full max-md:max-w-full max-md:overflow-y-auto max-md:rounded-none max-md:pb-[calc(24px+env(safe-area-inset-bottom))]"
      )}
      aria-label={String(t("dashboard.preview.panelAria"))}
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1 pt-2.5">
          <h3 className="text-text-primary line-clamp-2 text-xl leading-6 font-semibold break-all">
            {file.filename}
          </h3>
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <span>{formatBytes(file.size)}</span>
            <span className="text-text-disabled">•</span>
            <span>{formatDate(file.created_at, getCurrentLanguage())}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={String(t("dashboard.actions.close"))}
          className="text-text-secondary hover:bg-state-primary-hover flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg"
        >
          <CloseIcon size={24} />
        </button>
      </div>

      <div className="relative flex max-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl bg-[var(--color-grey-300,#e0e0e0)]">
        <div className="scrollbar-thin flex flex-1 flex-col items-center gap-3 overflow-y-auto p-6">
          {loading && (
            <span className="text-text-secondary text-sm">
              {String(t("dashboard.preview.loading"))}
            </span>
          )}
          {!loading && url && isPdf && (
            <PDFPagesPreview url={url} onPagesLoaded={setTotalPages} />
          )}
          {!loading && url && isImage && (
            <img
              src={url}
              alt={file.filename}
              className="max-h-full max-w-full rounded-lg object-contain shadow"
            />
          )}
          {!loading && !isPdf && !isImage && (
            <div className="text-text-secondary flex flex-col items-center gap-2 text-sm">
              <span className="rounded-lg bg-white px-4 py-3 font-medium uppercase shadow-sm">
                {file.internal_type}
              </span>
              {String(t("dashboard.preview.unsupported"))}
            </div>
          )}
        </div>
        {totalPages !== null && (
          <div className="absolute end-2 bottom-2 rounded-lg bg-black/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <span>1</span>
            <span className="text-white/60"> / {totalPages}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {QUICK_ACTIONS.map((action) => (
          <a
            key={action.labelKey}
            href={localizedHref(action.url)}
            className="flex cursor-pointer items-center gap-1 rounded-2xl bg-[var(--color-primary-opacity-12)] px-2.5 py-1 text-sm transition-colors hover:bg-[var(--color-primary-opacity-32)]"
          >
            <img
              src={action.icon}
              alt=""
              aria-hidden
              className="h-[18px] w-[18px]"
            />
            <span className="text-text-primary leading-5">
              {String(t(action.labelKey as never))}
            </span>
          </a>
        ))}
      </div>

      {/* TODO: uncomment Edit button when edit feature is implemented
      <Button
        size="md"
        className="flex w-full items-center justify-center gap-1.5"
      >
        Edit
      </Button>
      */}

      <div className="h-px bg-[var(--color-os-divider)]" />

      <div className="grid grid-cols-2 gap-2">
        <PreviewActionButton
          icon={<CopyIcon size={18} />}
          label={String(t("dashboard.preview.createCopy"))}
          onClick={() => {
            void duplicate(file.id);
          }}
        />
        <PreviewActionButton
          icon={<MailIcon size={18} />}
          label={String(t("dashboard.actions.sendEmail"))}
          onClick={() =>
            openModal({
              type: EModalsTypes.DASHBOARD_SEND_BY_EMAIL,
              options: { fileId: file.id, filename: file.filename },
            })
          }
        />
        <PreviewActionButton
          icon={<PrintIcon size={18} />}
          label={String(t("dashboard.actions.print"))}
          onClick={() => {
            void print(file);
          }}
        />
        <PreviewActionButton
          icon={<RenameIcon size={18} />}
          label={String(t("dashboard.actions.rename"))}
          onClick={() =>
            openModal({
              type: EModalsTypes.DASHBOARD_RENAME_FILE,
              options: { fileId: file.id, filename: file.filename },
            })
          }
        />
        <PreviewActionButton
          icon={<ShareIcon size={18} />}
          label={String(t("dashboard.actions.shareLink"))}
          onClick={() =>
            openModal({
              type: EModalsTypes.DASHBOARD_SHARE_LINK,
              options: { fileId: file.id, filename: file.filename },
            })
          }
        />
        <PreviewActionButton
          icon={<TrashIcon size={18} />}
          label={String(t("dashboard.actions.delete"))}
          danger
          onClick={() =>
            openModal({
              type: EModalsTypes.DASHBOARD_DELETE_FILES,
              options: { ids: [file.id], filename: file.filename },
            })
          }
        />
      </div>

      <div className="h-px bg-[var(--color-os-divider)]" />

      <Button
        size="md"
        onClick={() => {
          void downloadOne(file);
        }}
        className="flex w-full items-center justify-center gap-1.5 bg-black text-white hover:bg-black/85"
      >
        <DownloadIcon size={18} />
        {String(t("dashboard.actions.download"))}
      </Button>
    </aside>
  );
};

interface PreviewActionButtonProps {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

const PreviewActionButton: FC<PreviewActionButtonProps> = ({
  icon,
  label,
  danger,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-[rgba(0,0,0,0.04)]",
      danger ? "text-[var(--color-error-main)]" : "text-text-primary"
    )}
  >
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
      {icon}
    </span>
    {label}
  </button>
);
