import React from "react";

import { AiMessageLayout } from "./AiMessageLayout";
import { AiResponseBody } from "./AiResponseBody";

interface AiResponseProps {
  content: string;
}

export const AiResponse: React.FC<AiResponseProps> = ({ content }) => (
  <AiMessageLayout>
    <AiResponseBody content={content} />
  </AiMessageLayout>
);
