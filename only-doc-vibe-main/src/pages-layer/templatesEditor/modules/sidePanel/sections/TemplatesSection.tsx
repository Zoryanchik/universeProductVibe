import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useState, useMemo, useRef, type FC, useCallback } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../ui/IconButton";
import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";
import {
  DropdownMenu,
  type DropdownMenuOption,
} from "../../../ui/DropdownMenu";
import { Tag } from "../../../ui/Tag";
import { Button } from "../../../ui/Button";
import { CustomScrollArea } from "../../../ui/CustomScrollArea";
import { useLoadTemplate } from "../../../helpers/loadTemplate";
import { useThumbnail } from "../../../helpers/thumbnail";
import { useTemplatesEditorStore } from "../../../model/store/templates-editor-store";
import { SearchTab } from "./common/tabs/Search";

interface TemplatesSectionPanelProps {
  store: StoreType;
}

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const SUB_CAT_PREFIX = "sub::";

function formatSubCategoryTitle(
  subCatName: string,
  parentCatName: string
): string {
  let cleaned = subCatName;
  if (cleaned.endsWith(`-${parentCatName}`)) {
    cleaned = cleaned.slice(0, -(parentCatName.length + 1));
  } else if (cleaned.startsWith(`${parentCatName}-`)) {
    cleaned = cleaned.slice(parentCatName.length + 1);
  }

  return cleaned
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const TemplatesSectionPanel: FC<TemplatesSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState<
      string[]
    >([]);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [sectionResetKey, setSectionResetKey] = useState(0);
    const templatesData = useTemplatesEditorStore.use.templatesData();
    const showToast = useTemplatesEditorStore.use.showToast();

    const categoryOptions: DropdownMenuOption[] = useMemo(() => {
      if (!templatesData) return [];

      const options: DropdownMenuOption[] = [];
      for (const cat of templatesData.categories) {
        const hasChildren = cat.subCategories.length > 0;
        const isExpanded = hasChildren && expandedCategories.includes(cat.name);

        options.push({
          label: cat.title,
          value: cat.name,
          expandable: hasChildren,
          expanded: isExpanded,
        });

        if (isExpanded) {
          for (const sub of cat.subCategories) {
            options.push({
              label: formatSubCategoryTitle(sub.name, cat.name),
              value: `${SUB_CAT_PREFIX}${sub.name}`,
              depth: 1,
            });
          }
        }
      }

      return options;
    }, [templatesData, expandedCategories]);

    const allSelectedValues = useMemo(
      () => [
        ...selectedCategories,
        ...selectedSubCategories.map((s) => `${SUB_CAT_PREFIX}${s}`),
      ],
      [selectedCategories, selectedSubCategories]
    );

    const page = store.pages[0];
    const { thumbnail } = useThumbnail(page, store);

    const filterButtonRef = useRef<HTMLDivElement>(null);

    const { loadTemplate } = useLoadTemplate({ store });

    const filteredTemplates = useMemo(() => {
      if (!templatesData) return [];

      const matchTags = new Set<string>();

      for (const catName of selectedCategories) {
        const cat = templatesData.categories.find((c) => c.name === catName);
        if (!cat) continue;

        if (cat.subCategories.length === 0) {
          matchTags.add(catName);
          continue;
        }

        for (const sub of cat.subCategories) {
          matchTags.add(sub.name);
        }
      }

      for (const sub of selectedSubCategories) {
        matchTags.add(sub);
      }

      return templatesData.templates
        .filter((template) => {
          if (
            query &&
            !template.title.toLowerCase().includes(query.toLowerCase())
          ) {
            return false;
          }

          if (matchTags.size === 0) return true;

          return template.subCategories.some((tag) => matchTags.has(tag));
        })
        .map((t) => ({
          id: t.templateId,
          src: t.coverImageUrl ?? TRANSPARENT_PIXEL,
        }));
    }, [query, selectedCategories, selectedSubCategories, templatesData]);

    const currentTemplateAndFilteredTemplates = useMemo(() => {
      return [
        { id: page.id, src: thumbnail ?? TRANSPARENT_PIXEL, checked: true },
        ...filteredTemplates,
      ];
    }, [filteredTemplates, thumbnail, page.id]);

    const meta = useMemo(
      () => ({
        query,
        page: 1 as const,
        totalPages: 1 as const,
        total: filteredTemplates.length,
      }),
      [query, filteredTemplates.length]
    );

    const handleToggleOption = useCallback(
      (value: string) => {
        if (value.startsWith(SUB_CAT_PREFIX)) {
          const subName = value.slice(SUB_CAT_PREFIX.length);
          const isSelected = selectedSubCategories.includes(subName);
          const parent = templatesData?.categories.find((c) =>
            c.subCategories.some((sc) => sc.name === subName)
          );

          if (isSelected) {
            if (parent) {
              setSelectedCategories((prev) =>
                prev.filter((c) => c !== parent.name)
              );
            }
          } else if (parent) {
            const allSiblingsWillBeSelected = parent.subCategories.every(
              (sc) =>
                sc.name === subName || selectedSubCategories.includes(sc.name)
            );
            if (allSiblingsWillBeSelected) {
              setSelectedCategories((prev) =>
                prev.includes(parent.name) ? prev : [...prev, parent.name]
              );
            }
          }

          setSelectedSubCategories((prev) =>
            isSelected ? prev.filter((s) => s !== subName) : [...prev, subName]
          );

          return;
        }

        const wasSelected = selectedCategories.includes(value);
        const cat = templatesData?.categories.find((c) => c.name === value);
        const childNames = cat?.subCategories.map((s) => s.name) ?? [];

        setSelectedCategories((prev) =>
          wasSelected ? prev.filter((c) => c !== value) : [...prev, value]
        );

        if (childNames.length > 0) {
          setSelectedSubCategories((prev) => {
            const withoutChildren = prev.filter((s) => !childNames.includes(s));

            return wasSelected
              ? withoutChildren
              : [...withoutChildren, ...childNames];
          });
          setExpandedCategories((prev) =>
            prev.includes(value) ? prev : [...prev, value]
          );
        }
      },
      [templatesData, selectedCategories, selectedSubCategories]
    );

    const handleLoadTemplate = useCallback(
      (template: { id: string }) => {
        if (template.id === page.id) {
          return;
        }

        showToast({
          id: "change-template",
          header: t("templatesEditor.toasts.change_template_header") as string,
          content: t(
            "templatesEditor.toasts.change_template_content"
          ) as string,
          variant: "warning",
          button: {
            label: t("templatesEditor.common.replace") as string,
            onClick: () => {
              setQuery("");
              setSelectedCategories([]);
              setSelectedSubCategories([]);
              setExpandedCategories([]);
              setIsFilterOpen(false);
              setSectionResetKey((k) => k + 1);
              loadTemplate(template.id);
            },
          },
        });
      },
      [loadTemplate, page.id, showToast, t]
    );

    const handleGetImages = useCallback(
      ({ query: _query }: { query: string }) => setQuery(_query),
      []
    );

    const handleToggleFilter = useCallback(
      () => setIsFilterOpen((prev) => !prev),
      []
    );
    const handleCloseFilter = useCallback(() => setIsFilterOpen(false), []);
    const handleToggleExpand = useCallback((value: string) => {
      setExpandedCategories((prev) =>
        prev.includes(value)
          ? prev.filter((c) => c !== value)
          : [...prev, value]
      );
    }, []);
    const handleClearAll = useCallback(() => {
      setSelectedCategories([]);
      setSelectedSubCategories([]);
      setExpandedCategories([]);
    }, []);

    const hasActiveFilters =
      selectedCategories.length > 0 || selectedSubCategories.length > 0;

    const resetScrollKey = `${sectionResetKey}-${selectedCategories.join(
      ","
    )}-${selectedSubCategories.join(",")}`;

    const filterContent = useMemo(
      () => (
        <>
          <div ref={filterButtonRef} className="flex-shrink-0">
            <IconButton
              iconName="filter_alt"
              active={isFilterOpen || hasActiveFilters}
              onClick={handleToggleFilter}
              size="large"
            />
          </div>
          <DropdownMenu
            isOpen={isFilterOpen}
            options={categoryOptions}
            onSelect={handleToggleOption}
            onToggleExpand={handleToggleExpand}
            onClose={handleCloseFilter}
            anchorRef={filterButtonRef}
            placement="bottom"
            multiSelect
            selectedValues={allSelectedValues}
            maxItems={8}
            minWidth={220}
            footerContent={
              hasActiveFilters ? (
                <Button
                  onClick={handleClearAll}
                  variant="outlined"
                  colorType="secondary"
                >
                  {t("templatesEditor.common.clear_all")}
                </Button>
              ) : null
            }
          />
        </>
      ),
      [
        isFilterOpen,
        hasActiveFilters,
        categoryOptions,
        allSelectedValues,
        handleToggleFilter,
        handleCloseFilter,
        handleToggleOption,
        handleToggleExpand,
        handleClearAll,
        t,
      ]
    );

    const subCategoryTagLabel = useCallback(
      (subName: string): string => {
        if (!templatesData) return subName;

        const parent = templatesData.categories.find((c) =>
          c.subCategories.some((sc) => sc.name === subName)
        );
        if (!parent) return subName;

        const shortLabel = formatSubCategoryTitle(subName, parent.name);

        return `${shortLabel} ${parent.title}`;
      },
      [templatesData]
    );

    const belowSearchContent = useMemo(() => {
      if (!templatesData) return null;

      const tags: { key: string; label: string; onDelete: () => void }[] = [];

      for (const cat of templatesData.categories) {
        const isParentSelected = selectedCategories.includes(cat.name);

        if (cat.subCategories.length === 0) {
          if (isParentSelected) {
            const catOption = categoryOptions.find((o) => o.value === cat.name);
            tags.push({
              key: `cat-${cat.name}`,
              label: catOption?.label ?? cat.name,
              onDelete: () => handleToggleOption(cat.name),
            });
          }

          continue;
        }

        const selectedChildren = cat.subCategories.filter((sc) =>
          selectedSubCategories.includes(sc.name)
        );
        const allChildrenSelected =
          selectedChildren.length === cat.subCategories.length;

        if (allChildrenSelected) {
          const catOption = categoryOptions.find((o) => o.value === cat.name);
          tags.push({
            key: `cat-${cat.name}`,
            label: catOption?.label ?? cat.name,
            onDelete: () => handleToggleOption(cat.name),
          });
        } else {
          for (const sc of selectedChildren) {
            tags.push({
              key: `sub-${sc.name}`,
              label: subCategoryTagLabel(sc.name),
              onDelete: () => handleToggleOption(`${SUB_CAT_PREFIX}${sc.name}`),
            });
          }
        }
      }

      return (
        <CustomScrollArea className="max-h-[213px] flex-shrink-0">
          <div className="box-border flex w-full flex-shrink-0 flex-wrap items-center gap-2 px-5 py-[2px]">
            {tags.map((tag) => (
              <Tag key={tag.key} label={tag.label} onDelete={tag.onDelete} />
            ))}
          </div>
        </CustomScrollArea>
      );
    }, [
      templatesData,
      selectedCategories,
      selectedSubCategories,
      categoryOptions,
      handleToggleOption,
      subCategoryTagLabel,
    ]);

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden pt-5">
        <div className="box-border flex w-full flex-shrink-0 flex-col gap-3 px-5">
          <SidePanelSectionLabel
            label={t("templatesEditor.templates_section.heading") as string}
            type="header"
          />
        </div>
        <SearchTab
          images={currentTemplateAndFilteredTemplates}
          meta={meta}
          store={store}
          type="custom"
          placeholder=" "
          imagesLabel={
            query.trim() || hasActiveFilters
              ? (t("templatesEditor.templates_section.results") as string)
              : (t("templatesEditor.templates_section.all_templates") as string)
          }
          onGetImages={handleGetImages}
          onClick={handleLoadTemplate}
          filterContent={filterContent}
          belowSearchContent={belowSearchContent}
          resetScrollKey={resetScrollKey}
          resetSearchKey={sectionResetKey}
          size="medium"
        />
      </div>
    );
  }
);
