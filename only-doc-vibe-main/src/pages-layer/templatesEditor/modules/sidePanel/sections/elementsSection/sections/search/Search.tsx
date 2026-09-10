import debounce from "lodash/debounce";
import { useState, useEffect, useRef, useMemo, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { SearchInput } from "../../../../../../ui/SearchInput";
import { useTemplatesEditorStore } from "../../../../../../model/store/templates-editor-store";
import IconsHeader from "./IconsHeader";

const SEARCH_DEBOUNCE_MS = 350;

const SearchSection: FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const nounProjectIcons = useTemplatesEditorStore.use.nounProjectIcons();
  const nounProjectIconsMeta =
    useTemplatesEditorStore.use.nounProjectIconsMeta();
  const fetchNounProjectIcons =
    useTemplatesEditorStore.use.fetchNounProjectIcons();

  const metaRef = useRef(nounProjectIconsMeta);
  const iconsRef = useRef(nounProjectIcons);
  metaRef.current = nounProjectIconsMeta;
  iconsRef.current = nounProjectIcons;

  const debouncedSetQuery = useMemo(
    () =>
      debounce((value: string) => setDebouncedQuery(value), SEARCH_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debouncedSetQuery(searchQuery);
  }, [debouncedSetQuery, searchQuery]);

  useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    const meta = metaRef.current;
    const icons = iconsRef.current;

    if (trimmed === "" && meta?.query === "" && icons.length > 0) return;

    if (trimmed === "" && icons.length === 0 && meta === null) return;

    fetchNounProjectIcons({ query: trimmed, page: 1 });
  }, [debouncedQuery, fetchNounProjectIcons]);

  return (
    <>
      <IconsHeader isEmptySearch={!debouncedQuery.trim()} />
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        size="large"
        placeholder={
          t("templatesEditor.side_panel.upload.search_placeholder") as string
        }
      />
    </>
  );
};

export default SearchSection;
