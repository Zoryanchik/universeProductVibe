import React from "react";

const props = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon: React.FC = () => (
  <svg {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const UndoIcon: React.FC = () => (
  <svg {...props}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
  </svg>
);

export const RedoIcon: React.FC = () => (
  <svg {...props}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
  </svg>
);

export const HandIcon: React.FC = () => (
  <svg {...props}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v6" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

export const SignatureIcon: React.FC = () => (
  <svg {...props}>
    <path d="M3 17c4 0 4-8 8-8s4 8 8 8" />
    <path d="M2 21h20" />
  </svg>
);

export const WatermarkIcon: React.FC = () => (
  <svg {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 14l2 2 6-6" />
  </svg>
);

export const InsertIcon: React.FC = () => (
  <svg {...props}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <line x1="12" y1="13" x2="12" y2="19" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);

export const DeleteIcon: React.FC = () => (
  <svg {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

export const ZoomIcon: React.FC = () => (
  <svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
    <line x1="8" y1="11" x2="14" y2="11" />
    <line x1="11" y1="8" x2="11" y2="14" />
  </svg>
);

export const MaterialIcon: React.FC = () => (
  <svg {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <circle cx="17.5" cy="6.5" r="3.5" />
    <path d="m3 21 5-8 5 8" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

export const TextIcon: React.FC = () => (
  <svg {...props}>
    <path d="M4 4h16" />
    <path d="M12 4v16" />
  </svg>
);

export const ImageIcon: React.FC = () => (
  <svg {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export const ToolIcon: React.FC = () => (
  <svg {...props}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2-2z" />
  </svg>
);

export const ExportIcon: React.FC = () => (
  <svg {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const MergeIcon: React.FC = () => (
  <svg {...props}>
    <path d="M8 3v6a4 4 0 0 0 4 4 4 4 0 0 1 4 4v4" />
    <path d="M16 3v6a4 4 0 0 1-4 4 4 4 0 0 0-4 4v4" />
  </svg>
);

export const SplitIcon: React.FC = () => (
  <svg {...props}>
    <path d="M16 3h5v5" />
    <path d="M8 3H3v5" />
    <path d="M3 16v5h5" />
    <path d="M16 21h5v-5" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

export const ChevronDownIcon: React.FC = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
