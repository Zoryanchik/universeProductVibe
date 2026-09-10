import React, { useCallback, useMemo, useRef } from "react";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditor, useEditorActions } from "@/features/editor";
import { MaterialPanel } from "@/features/editorMaterial";
import {
  ImageUploadInput,
  WatermarkModal,
  SignatureModal,
} from "@/features/editorTools";

import { ToolbarButton } from "./ToolbarButton";
import { ToolbarMenu, type ToolbarMenuItem } from "./ToolbarMenu";
import {
  HomeIcon,
  UndoIcon,
  RedoIcon,
  HandIcon,
  SignatureIcon,
  WatermarkIcon,
  InsertIcon,
  DeleteIcon,
  ZoomIcon,
  MaterialIcon,
  TextIcon,
  ImageIcon,
  ToolIcon,
  MergeIcon,
  SplitIcon,
} from "./ToolbarIcons";

export const EditorToolbar: React.FC = () => {
  const { t } = useTranslation();
  const actions = useEditorActions();
  const {
    openMerge,
    openSplit,
    openToolModal,
    openTool,
    closeTool,
    isHandActive,
    setHandActive,
  } = useEditor();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const editingDisabled = !actions.isReady;

  const handleMergePick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      event.target.value = "";

      openMerge({ mode: "editor", seedFiles: files });
    },
    [openMerge]
  );

  const toggleHand = () => {
    const next = !isHandActive;
    setHandActive(next);
    actions.toggleHand(next);
  };

  const requireDoc = (fn: () => void) => () => {
    if (editingDisabled) return;

    fn();
  };

  const textItems: ToolbarMenuItem[] = useMemo(
    () => [
      {
        id: "title",
        label: String(t("editor_page.toolbar.text_title")),
        onSelect: actions.addTitle,
      },
      {
        id: "subtitle",
        label: String(t("editor_page.toolbar.text_subtitle")),
        onSelect: actions.addSubtitle,
      },
      {
        id: "body",
        label: String(t("editor_page.toolbar.text_body")),
        onSelect: actions.addBody,
      },
      {
        id: "hollow",
        label: String(t("editor_page.toolbar.text_hollow")),
        onSelect: actions.addHollowText,
      },
    ],
    [actions, t]
  );

  const insertItems: ToolbarMenuItem[] = useMemo(
    () => [
      {
        id: "above",
        label: String(t("editor_page.toolbar.insert_above")),
        onSelect: actions.addPageAbove,
      },
      {
        id: "below",
        label: String(t("editor_page.toolbar.insert_below")),
        onSelect: actions.addPageBelow,
      },
    ],
    [actions, t]
  );

  const zoomItems: ToolbarMenuItem[] = useMemo(
    () => [
      {
        id: "zoom-in",
        label: String(t("editor_page.toolbar.zoom_in")),
        onSelect: actions.zoomIn,
      },
      {
        id: "zoom-out",
        label: String(t("editor_page.toolbar.zoom_out")),
        onSelect: actions.zoomOut,
      },
      {
        id: "fit",
        label: String(t("editor_page.toolbar.fit_to_screen")),
        onSelect: actions.fitToScreen,
      },
      {
        id: "reset",
        label: String(t("editor_page.toolbar.zoom_reset")),
        onSelect: actions.resetZoom,
      },
    ],
    [actions, t]
  );

  const toolItems: ToolbarMenuItem[] = useMemo(
    () => [
      {
        id: "qr",
        label: String(t("editor_page.toolbar.tool_qr")),
        onSelect: () => {
          if (editingDisabled) return;

          actions.addQRCode();
        },
      },
      {
        id: "bar",
        label: String(t("editor_page.toolbar.tool_barcode")),
        onSelect: () => {
          if (editingDisabled) return;

          actions.addBarCode();
        },
      },
    ],
    [actions, editingDisabled, t]
  );

  return (
    <>
      <div className="flex h-[60px] items-center gap-1 overflow-x-auto border-b border-white/5 bg-[#1F2125] px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ToolbarButton
          label={String(t("editor_page.toolbar.home"))}
          icon={<HomeIcon />}
          onClick={actions.goHome}
        />

        <span className="mx-1 h-8 w-px bg-white/10" />

        <ToolbarButton
          label={String(t("editor_page.toolbar.undo"))}
          icon={<UndoIcon />}
          onClick={actions.undo}
          disabled={editingDisabled}
        />
        <ToolbarButton
          label={String(t("editor_page.toolbar.redo"))}
          icon={<RedoIcon />}
          onClick={actions.redo}
          disabled={editingDisabled}
        />
        <ToolbarButton
          label={String(t("editor_page.toolbar.hand"))}
          icon={<HandIcon />}
          onClick={toggleHand}
          active={isHandActive}
          disabled={editingDisabled}
        />

        <span className="mx-1 h-8 w-px bg-white/10" />

        <ToolbarButton
          label={String(t("editor_page.toolbar.signature"))}
          icon={<SignatureIcon />}
          onClick={requireDoc(() => openTool("signature"))}
          disabled={editingDisabled}
        />
        <ToolbarButton
          label={String(t("editor_page.toolbar.watermark"))}
          icon={<WatermarkIcon />}
          onClick={requireDoc(() => openTool("watermark"))}
          disabled={editingDisabled}
        />

        <ToolbarMenu
          items={insertItems}
          trigger={({ ref, onClick, isOpen }) => (
            <ToolbarButton
              ref={ref}
              label={String(t("editor_page.toolbar.insert"))}
              icon={<InsertIcon />}
              onClick={onClick}
              active={isOpen}
              hasMenu
              disabled={editingDisabled}
            />
          )}
        />

        <ToolbarButton
          label={String(t("editor_page.toolbar.delete"))}
          icon={<DeleteIcon />}
          onClick={actions.deleteSelected}
          disabled={editingDisabled}
        />

        <ToolbarMenu
          items={zoomItems}
          trigger={({ ref, onClick, isOpen }) => (
            <ToolbarButton
              ref={ref}
              label={String(t("editor_page.toolbar.zoom"))}
              icon={<ZoomIcon />}
              onClick={onClick}
              active={isOpen}
              hasMenu
              disabled={editingDisabled}
            />
          )}
        />

        <span className="mx-1 h-8 w-px bg-white/10" />

        <ToolbarButton
          label={String(t("editor_page.toolbar.material"))}
          icon={<MaterialIcon />}
          onClick={requireDoc(() => openTool("material"))}
          active={openToolModal === "material"}
          disabled={editingDisabled}
        />

        <ToolbarMenu
          items={textItems}
          trigger={({ ref, onClick, isOpen }) => (
            <ToolbarButton
              ref={ref}
              label={String(t("editor_page.toolbar.text"))}
              icon={<TextIcon />}
              onClick={onClick}
              active={isOpen}
              hasMenu
              disabled={editingDisabled}
            />
          )}
        />

        <ToolbarButton
          label={String(t("editor_page.toolbar.image"))}
          icon={<ImageIcon />}
          onClick={requireDoc(() => imageInputRef.current?.click())}
          disabled={editingDisabled}
        />

        <ToolbarMenu
          items={toolItems}
          trigger={({ ref, onClick, isOpen }) => (
            <ToolbarButton
              ref={ref}
              label={String(t("editor_page.toolbar.tool"))}
              icon={<ToolIcon />}
              onClick={onClick}
              active={isOpen}
              hasMenu
              disabled={editingDisabled}
            />
          )}
        />

        <div className="flex-1" />

        {editingDisabled && (
          <span className="me-3 text-xs text-white/50">
            {String(t("editor_page.toolbar.load_pdf_hint"))}
          </span>
        )}

        <ToolbarButton
          label={String(t("editor_page.toolbar.merge"))}
          icon={<MergeIcon />}
          onClick={requireDoc(() => mergeInputRef.current?.click())}
          disabled={editingDisabled}
        />
        <ToolbarButton
          label={String(t("editor_page.toolbar.split"))}
          icon={<SplitIcon />}
          onClick={requireDoc(openSplit)}
          disabled={editingDisabled}
        />

        <ImageUploadInput ref={imageInputRef} />

        <input
          ref={mergeInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={handleMergePick}
        />
      </div>

      <WatermarkModal
        isOpen={openToolModal === "watermark"}
        onClose={closeTool}
      />
      <SignatureModal
        isOpen={openToolModal === "signature"}
        onClose={closeTool}
      />
      <MaterialPanel
        isOpen={openToolModal === "material"}
        onClose={closeTool}
      />
    </>
  );
};
