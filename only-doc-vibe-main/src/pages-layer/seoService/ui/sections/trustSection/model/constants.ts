import type { ITrustBadge } from "./types";

export const TRUST_BADGES: readonly ITrustBadge[] = [
  {
    id: "norton",
    name: "Norton by Symantec",
    iconPath: "/assets/trust/norton.png",
    alt: "Norton by Symantec - Trusted Security",
  },
  {
    id: "dmca",
    name: "DMCA Protected",
    iconPath: "/assets/trust/dmca.png",
    alt: "DMCA Protected",
  },
  {
    id: "gdpr",
    name: "GDPR Compliant",
    iconPath: "/assets/trust/gdpr.png",
    alt: "GDPR - General Data Protection Regulation",
  },
  {
    id: "ssl",
    name: "Secure SSL Encryption",
    iconPath: "/assets/trust/ssl.png",
    alt: "Secure SSL Encryption",
  },
  {
    id: "google-safe",
    name: "Google Safe Browsing",
    iconPath: "/assets/trust/google-safe.png",
    alt: "Google Safe Browsing",
  },
  {
    id: "pci-dss",
    name: "PCI DSS Compliant",
    iconPath: "/assets/trust/pci-dss.png",
    alt: "PCI DSS Compliant",
  },
] as const;
