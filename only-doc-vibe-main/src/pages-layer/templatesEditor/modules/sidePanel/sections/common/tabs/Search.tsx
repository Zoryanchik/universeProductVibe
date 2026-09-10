import debounce from "lodash/debounce";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

import { useTranslation } from "@/shared/lib/translations";

import { SearchInput } from "../../../../../ui/SearchInput";
import UploadList from "../../../../../components/uploadList/UploadList";
import type { IUnsplashListMeta } from "../../../../../model/types";
import { MyUploadsSection } from "./upload/sections/MyUploads";

const SEARCH_DEBOUNCE_MS = 350;

interface IImage {
  id: string;
  src: string;
  checked?: boolean;
}

const EMPTY_IMAGES: IImage[] = [];

interface IMeta extends IUnsplashListMeta {
  filters?: string[];
}

interface SearchTabProps {
  store: StoreType;
  images: IImage[] | null;
  meta: IMeta | null;
  onGetImages: (params: {
    query: string;
    page: number;
    append?: boolean;
  }) => void;
  placeholder?: string;
  imagesLabel?: string;
  type: "image" | "background" | "custom";
  onClick?: (image: IImage) => void;
  filterContent?: React.ReactNode;
  belowSearchContent?: React.ReactNode;
  resetScrollKey?: string | number;
  resetSearchKey?: string | number;
  size?: "medium" | "large";
}

export const SearchTab: FC<SearchTabProps> = observer(
  ({
    store,
    images,
    meta,
    onGetImages,
    placeholder,
    type,
    imagesLabel,
    filterContent,
    belowSearchContent,
    onClick,
    resetScrollKey,
    resetSearchKey,
    size = "large",
  }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const listRef = useRef<HTMLDivElement>(null);
    const skipInitialResetSearchKeyRef = useRef(true);
    const isLoadingMoreRef = useRef(false);
    const metaRef = useRef(meta);
    const imagesRef = useRef(images);
    metaRef.current = meta;
    imagesRef.current = images;

    const debouncedSetQuery = useMemo(
      () =>
        debounce(
          (value: string) => setDebouncedQuery(value),
          SEARCH_DEBOUNCE_MS
        ),
      []
    );

    useEffect(() => {
      debouncedSetQuery(searchQuery);
    }, [debouncedSetQuery, searchQuery]);

    useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery]);

    useEffect(() => {
      listRef.current?.scrollTo({ top: 0 });
    }, [resetScrollKey]);

    useEffect(() => {
      if (resetSearchKey === undefined) return;

      if (skipInitialResetSearchKeyRef.current) {
        skipInitialResetSearchKeyRef.current = false;

        return;
      }

      debouncedSetQuery.cancel();
      setSearchQuery("");
      setDebouncedQuery("");
      listRef.current?.scrollTo({ top: 0 });
    }, [resetSearchKey, debouncedSetQuery]);

    useEffect(() => {
      const trimmed = debouncedQuery.trim();
      const meta = metaRef.current;
      const images = imagesRef.current;

      if (trimmed === "" && meta?.query === "" && images) {
        return;
      }

      if (trimmed === "" && !images && meta === null) {
        return;
      }

      listRef.current?.scrollTo({ top: 0 });
      onGetImages({ query: trimmed, page: 1 });
    }, [debouncedQuery, onGetImages]);

    const handleScrollEnd = useCallback(() => {
      if (!meta || !images?.length) return;

      if (meta.page >= meta.totalPages) return;

      if (isLoadingMoreRef.current) return;

      isLoadingMoreRef.current = true;
      onGetImages({ query: meta.query, page: meta.page + 1, append: true });
      isLoadingMoreRef.current = false;
    }, [meta, images?.length, onGetImages]);

    return (
      <>
        <div className="box-border flex w-full flex-shrink-0 items-center gap-3 px-5">
          <div className="min-w-0 flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              size={size}
              placeholder={
                placeholder ||
                (t(
                  "templatesEditor.side_panel.upload.search_placeholder"
                ) as string)
              }
            />
          </div>
          {filterContent}
        </div>
        {belowSearchContent}
        <MyUploadsSection
          ref={listRef}
          count={
            t("templatesEditor.side_panel.upload.results_count", {
              count: meta?.total ?? 0,
            }) as string
          }
          uploadLabel={
            imagesLabel ||
            (t(
              "templatesEditor.side_panel.upload.photos_from_unsplash"
            ) as string)
          }
          onScrollEnd={handleScrollEnd}
          UploadList={
            <UploadList
              onClick={onClick}
              store={store}
              images={images ?? EMPTY_IMAGES}
              type={type}
            />
          }
        />
      </>
    );
  }
);

export default SearchTab;
