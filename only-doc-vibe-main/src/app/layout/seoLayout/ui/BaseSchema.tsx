import type { FC } from "react";

export interface IProps {
  data: unknown;
}

export const BaseSchema: FC<IProps> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data),
    }}
  />
);
