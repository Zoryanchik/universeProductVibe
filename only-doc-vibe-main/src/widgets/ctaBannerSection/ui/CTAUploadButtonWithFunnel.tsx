"use client";

import { UploadButton } from "@/shared/ui/upload-button";

import { withFunnelUpload } from "@/features/funnelUpload";

export const CTAUploadButtonWithFunnel = withFunnelUpload(UploadButton);
