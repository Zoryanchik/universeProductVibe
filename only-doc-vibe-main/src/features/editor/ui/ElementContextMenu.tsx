import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  activateCanvasTarget,
  getCanvasTargetAtClientPoint,
  getContextMenuAnchorPoint,
  type EditorAlignCommand,
  type EditorLayerDirection,
} from "../model/sdkBindings";
import { useEditor } from "../model/EditorContext";
import { useEditorActions } from "../model/useEditorActions";

type EditorTranslateFn = (key: string) => string | Record<string, unknown>;

interface MenuPosition {
  readonly x: number;
  readonly y: number;
}

interface ContextMenuAction {
  readonly id: string;
  readonly label: string;
  readonly shortcut?: string;
  readonly onClick: () => void;
  readonly danger?: boolean;
}

interface ContextMenuDivider {
  readonly id: string;
  readonly type: "divider";
}

interface ContextMenuSubmenu {
  readonly id: string;
  readonly label: string;
  readonly onClick?: () => void;
  readonly children: readonly ContextMenuAction[];
}

type ContextMenuEntry =
  | ContextMenuAction
  | ContextMenuDivider
  | ContextMenuSubmenu;

type ContextMenuMode = "canvas" | "element" | "locked";

const isDivider = (entry: ContextMenuEntry): entry is ContextMenuDivider =>
  "type" in entry && entry.type === "divider";

const isSubmenu = (entry: ContextMenuEntry): entry is ContextMenuSubmenu =>
  "children" in entry;

const MENU_WIDTH = 220;
const SUBMENU_CLOSE_DELAY_MS = 280;

const ChevronRight: React.FC = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const buildElementMenu = (
  actions: ReturnType<typeof useEditorActions>,
  isLocked: boolean,
  t: EditorTranslateFn
): ContextMenuEntry[] => {
  if (isLocked) {
    return [
      {
        id: "unlock",
        label: String(t("editor_page.context_menu.unlock")),
        onClick: () => actions.lockSelected(false),
      },
    ];
  }

  const align = (command: EditorAlignCommand) => () =>
    actions.alignSelected(command);
  const layer = (direction: EditorLayerDirection) => () =>
    actions.moveSelectedLayer(direction);

  return [
    {
      id: "cut",
      label: String(t("editor_page.context_menu.cut")),
      shortcut: "Ctrl + X",
      onClick: actions.cutSelected,
    },
    {
      id: "copy",
      label: String(t("editor_page.context_menu.copy")),
      shortcut: "Ctrl + C",
      onClick: actions.copySelected,
    },
    {
      id: "paste",
      label: String(t("editor_page.context_menu.paste")),
      shortcut: "Ctrl + V",
      onClick: actions.pasteSelected,
    },
    { id: "divider-1", type: "divider" },
    {
      id: "horizontal-center",
      label: String(t("editor_page.context_menu.horizontal_center")),
      onClick: align("horizontal"),
      children: [
        {
          id: "h-submenu-vertical-center",
          label: String(t("editor_page.context_menu.vertical_center")),
          onClick: align("vertical"),
        },
        {
          id: "h-submenu-horizontal-center",
          label: String(t("editor_page.context_menu.horizontal_center")),
          onClick: align("horizontal"),
        },
        {
          id: "h-submenu-align-left",
          label: String(t("editor_page.context_menu.align_left")),
          onClick: align("left"),
        },
        {
          id: "h-submenu-align-right",
          label: String(t("editor_page.context_menu.align_right")),
          onClick: align("right"),
        },
      ],
    },
    {
      id: "vertical-center",
      label: String(t("editor_page.context_menu.vertical_center")),
      onClick: align("vertical"),
      children: [
        {
          id: "v-submenu-horizontal-center",
          label: String(t("editor_page.context_menu.horizontal_center")),
          onClick: align("horizontal"),
        },
        {
          id: "v-submenu-vertical-center",
          label: String(t("editor_page.context_menu.vertical_center")),
          onClick: align("vertical"),
        },
        {
          id: "v-submenu-align-top",
          label: String(t("editor_page.context_menu.align_top")),
          onClick: align("top"),
        },
        {
          id: "v-submenu-align-bottom",
          label: String(t("editor_page.context_menu.align_bottom")),
          onClick: align("bottom"),
        },
      ],
    },
    { id: "divider-2", type: "divider" },
    {
      id: "bring-to-front",
      label: String(t("editor_page.context_menu.bring_to_front")),
      onClick: layer("front"),
      children: [
        {
          id: "layer-bring-front",
          label: String(t("editor_page.context_menu.bring_to_front")),
          onClick: layer("front"),
        },
        {
          id: "layer-up",
          label: String(t("editor_page.context_menu.move_up_one_layer")),
          onClick: layer("up"),
        },
      ],
    },
    {
      id: "send-to-back",
      label: String(t("editor_page.context_menu.send_to_back")),
      onClick: layer("back"),
      children: [
        {
          id: "layer-send-back",
          label: String(t("editor_page.context_menu.send_to_back")),
          onClick: layer("back"),
        },
        {
          id: "layer-down",
          label: String(t("editor_page.context_menu.move_down_one_layer")),
          onClick: layer("down"),
        },
      ],
    },
    { id: "divider-3", type: "divider" },
    {
      id: "lock",
      label: String(t("editor_page.context_menu.lock")),
      shortcut: "Ctrl + L",
      onClick: () => actions.lockSelected(true),
    },
    {
      id: "delete",
      label: String(t("editor_page.context_menu.delete")),
      shortcut: "Delete",
      onClick: actions.deleteSelected,
      danger: true,
    },
  ];
};

interface ContextSubmenuProps {
  readonly entry: ContextMenuSubmenu;
  readonly isOpen: boolean;
  readonly onOpen: () => void;
  readonly onScheduleClose: () => void;
  readonly onCancelClose: () => void;
  readonly onRun: (action: () => void) => void;
}

const ContextSubmenu: React.FC<ContextSubmenuProps> = ({
  entry,
  isOpen,
  onOpen,
  onScheduleClose,
  onCancelClose,
  onRun,
}) => (
  <div
    className="relative"
    onMouseEnter={() => {
      onCancelClose();
      onOpen();
    }}
    onMouseLeave={onScheduleClose}
  >
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={() => {
        if (entry.onClick) onRun(entry.onClick);
      }}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-3 py-2 text-start transition-colors",
        isOpen ? "bg-[#ede9fe] text-[#374151]" : "hover:bg-[#f3f4f6]"
      )}
    >
      <span>{entry.label}</span>
      <ChevronRight />
    </button>

    {isOpen && (
      <div
        className="absolute start-full top-0 z-[1101] -ms-2 flex min-h-full ps-2"
        onMouseEnter={() => {
          onCancelClose();
          onOpen();
        }}
        onMouseLeave={onScheduleClose}
      >
        <div
          role="menu"
          className="min-w-[200px] rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          {entry.children.map((child) => (
            <button
              key={child.id}
              type="button"
              role="menuitem"
              onClick={() => onRun(child.onClick)}
              className="flex w-full px-3 py-2 text-start transition-colors hover:bg-[#f3f4f6]"
            >
              {child.label}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const buildCanvasMenu = (
  actions: ReturnType<typeof useEditorActions>,
  t: EditorTranslateFn
): ContextMenuEntry[] => [
  {
    id: "paste",
    label: String(t("editor_page.context_menu.paste")),
    shortcut: "Ctrl + V",
    onClick: actions.pasteSelected,
  },
  {
    id: "select-all",
    label: String(t("editor_page.context_menu.select_all")),
    shortcut: "Ctrl + A",
    onClick: actions.selectAll,
  },
];

export const ElementContextMenu: React.FC = () => {
  const { t } = useTranslation();
  const { instance, selectedElement, isDocumentLoaded, setSelectedElement } =
    useEditor();
  const actions = useEditorActions();
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [menuMode, setMenuMode] = useState<ContextMenuMode>("canvas");
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuCloseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const closeMenu = useCallback(() => {
    if (submenuCloseTimer.current) {
      clearTimeout(submenuCloseTimer.current);
      submenuCloseTimer.current = undefined;
    }

    setPosition(null);
    setOpenSubmenuId(null);
  }, []);

  const cancelSubmenuClose = useCallback(() => {
    if (submenuCloseTimer.current) {
      clearTimeout(submenuCloseTimer.current);
      submenuCloseTimer.current = undefined;
    }
  }, []);

  const scheduleSubmenuClose = useCallback(() => {
    cancelSubmenuClose();
    submenuCloseTimer.current = setTimeout(() => {
      setOpenSubmenuId(null);
      submenuCloseTimer.current = undefined;
    }, SUBMENU_CLOSE_DELAY_MS);
  }, [cancelSubmenuClose]);

  const menuEntries = useMemo(() => {
    if (menuMode === "locked") {
      return buildElementMenu(actions, true, t);
    }

    if (menuMode === "element") {
      return buildElementMenu(actions, false, t);
    }

    return buildCanvasMenu(actions, t);
  }, [actions, menuMode, t]);

  useEffect(() => {
    if (!isDocumentLoaded) return;

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".pdf-editor-scope")) return;

      event.preventDefault();
      event.stopPropagation();

      setOpenSubmenuId(null);

      const scope = target.closest(".pdf-editor-scope") as HTMLElement | null;
      scope?.focus({ preventScroll: true });

      const hitTarget = getCanvasTargetAtClientPoint(
        instance,
        event.clientX,
        event.clientY
      );

      if (!hitTarget) {
        actions.clearSelection();
        setMenuMode("canvas");
        setPosition({
          x: Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 12),
          y: Math.min(event.clientY, window.innerHeight - 420),
        });
      } else {
        const element = activateCanvasTarget(instance, hitTarget);
        if (element) setSelectedElement(element);

        const isLocked = Boolean(
          hitTarget.lockMovementX && hitTarget.lockMovementY
        );
        setMenuMode(isLocked ? "locked" : "element");

        const anchored = isLocked
          ? getContextMenuAnchorPoint(instance, hitTarget, MENU_WIDTH, 48)
          : null;

        setPosition(
          anchored ?? {
            x: Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 12),
            y: Math.min(event.clientY, window.innerHeight - 420),
          }
        );
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [actions, instance, isDocumentLoaded, setSelectedElement]);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current?.contains(target)) return;

      closeMenu();
    };

    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("blur", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("blur", closeMenu);
    };
  }, [closeMenu]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;

      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const inEditor =
        !target ||
        Boolean(target.closest(".pdf-editor-scope")) ||
        target === document.body;

      if (!inEditor && !isDocumentLoaded) return;

      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();

        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) actions.redo();
          else actions.undo();
        } else if (key === "a") {
          event.preventDefault();
          actions.selectAll();
        } else if (key === "c") {
          event.preventDefault();
          actions.copySelected();
        } else if (key === "x") {
          event.preventDefault();
          actions.cutSelected();
        } else if (key === "v") {
          event.preventDefault();
          actions.pasteSelected();
        } else if (key === "l" && selectedElement) {
          event.preventDefault();
          actions.lockSelected(!selectedElement.isLocked);
        }
      } else if (event.key === "Delete" && selectedElement) {
        event.preventDefault();
        actions.deleteSelected();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actions, isDocumentLoaded, selectedElement]);

  useEffect(() => {
    if (!position || !menuRef.current) return;

    menuRef.current.style.left = `${position.x}px`;
    menuRef.current.style.top = `${position.y}px`;
  }, [position]);

  if (!position) return null;

  const runAction = (onClick: () => void) => {
    onClick();
    closeMenu();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[1100] min-w-[220px] overflow-visible rounded-lg border border-[#e5e7eb] bg-white py-1 text-sm text-[#374151] shadow-lg"
      role="menu"
      onClick={(event) => event.stopPropagation()}
    >
      {menuEntries.map((entry) => {
        if (isDivider(entry)) {
          return <div key={entry.id} className="mx-2 my-1 h-px bg-[#e5e7eb]" />;
        }

        if (isSubmenu(entry)) {
          return (
            <ContextSubmenu
              key={entry.id}
              entry={entry}
              isOpen={openSubmenuId === entry.id}
              onOpen={() => setOpenSubmenuId(entry.id)}
              onScheduleClose={scheduleSubmenuClose}
              onCancelClose={cancelSubmenuClose}
              onRun={runAction}
            />
          );
        }

        return (
          <button
            key={entry.id}
            type="button"
            role="menuitem"
            onClick={() => runAction(entry.onClick)}
            className={cn(
              "flex w-full items-center justify-between gap-4 px-3 py-2 text-start transition-colors hover:bg-[#f3f4f6]",
              entry.danger && "text-red-600 hover:bg-red-50 hover:text-red-700"
            )}
          >
            <span>{entry.label}</span>
            {entry.shortcut ? (
              <span className="shrink-0 text-xs text-[#9ca3af]">
                {entry.shortcut}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
