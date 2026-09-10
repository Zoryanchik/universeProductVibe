import { useEffect, type FC } from "react";

import {
  setCmsModalContent,
  type CmsModalContentMap,
} from "./cms-modal-content-store";

interface CmsModalDataHydratorProps {
  readonly data: Partial<CmsModalContentMap>;
}

export const CmsModalDataHydrator: FC<CmsModalDataHydratorProps> = ({
  data,
}) => {
  useEffect(() => {
    setCmsModalContent(data);
  }, [data]);

  return null;
};
