import React from "react";

import { AssistantAvatar } from "../../../AssistantAvatar";

interface AiMessageLayoutProps {
  children: React.ReactNode;
}

export const AiMessageLayout: React.FC<AiMessageLayoutProps> = ({
  children,
}) => (
  <div className="flex items-start gap-3">
    <AssistantAvatar />
    <div className="flex-1 space-y-2">{children}</div>
  </div>
);
