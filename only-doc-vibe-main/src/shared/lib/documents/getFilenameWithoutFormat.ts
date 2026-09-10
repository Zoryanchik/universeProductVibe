import { FILE_FORMAT_REGEX } from "../../constants/reg-exps";

export const getFileNameWithoutFormat = (filename: string) => {
  const formatMatch = filename.match(FILE_FORMAT_REGEX);

  const format = formatMatch?.[0];

  if (format) {
    return filename.replace(new RegExp(format + "$"), "");
  }

  return filename;
};
