import type { FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import UploadList from "../../../../../components/uploadList/UploadList";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";

interface IconsSectionProps {
  store: StoreType;
}

const IconsSection: FC<IconsSectionProps> = observer(({ store }) => {
  const nounProjectIcons = useTemplatesEditorStore.use.nounProjectIcons();

  return (
    <div className="box-border flex w-full flex-shrink-0 flex-col gap-4 px-5">
      <UploadList
        store={store}
        images={nounProjectIcons.map((icon) => ({
          id: icon.id,
          src: icon.preview_url_84,
        }))}
        size="small"
        type="svg"
      />
    </div>
  );
});

export default IconsSection;
