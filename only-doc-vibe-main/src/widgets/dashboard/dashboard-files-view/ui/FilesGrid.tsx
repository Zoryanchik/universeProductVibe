import type { FC } from "react";

import type { IUserFile } from "@/entities/documents";

import { DocCard } from "./DocCard";

interface Props {
  files: IUserFile[];
}

export const FilesGrid: FC<Props> = ({ files }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {files.map((file) => (
      <DocCard key={file.id} file={file} />
    ))}
  </div>
);
