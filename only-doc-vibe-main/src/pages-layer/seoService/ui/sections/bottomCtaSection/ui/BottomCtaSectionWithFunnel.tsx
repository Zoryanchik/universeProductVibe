"use client";

import { BottomCtaSection } from "@/shared/ui/bottom-cta-section";

import { withFunnelUpload } from "@/features/funnelUpload";

export const BottomCtaSectionWithFunnel = withFunnelUpload(BottomCtaSection);
