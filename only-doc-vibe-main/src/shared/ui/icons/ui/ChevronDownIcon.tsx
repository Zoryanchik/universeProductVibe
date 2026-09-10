import type { SVGProps } from "react";

interface ChevronDownIconProps extends SVGProps<SVGSVGElement> {
  readonly size?: number;
}

export const ChevronDownIcon = ({
  size = 16,
  className,
  ...props
}: ChevronDownIconProps): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
