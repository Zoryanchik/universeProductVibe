import React from "react";

interface AssistantAvatarProps {
  size?: number;
  className?: string;
}

// OnlyDoc-branded assistant avatar: the pixelated "O" mark from the brand
// favicon, rendered on a yellow (`--color-primary`) circular background.
// The favicon SVG is inlined so the avatar paints in one paint with no
// network round-trip and no flicker on slow connections.
export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({
  size = 32,
  className,
}) => {
  return (
    <div
      className={[
        "shrink-0 overflow-hidden rounded-full bg-[color:var(--color-primary)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 27 27"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          d="M9.8752 5.56445H6.07471V9.36494H9.8752V5.56445Z"
          fill="black"
        />
        <path
          d="M9.8752 9.36475H6.07471V13.1652H9.8752V9.36475Z"
          fill="black"
        />
        <path d="M9.8752 13.1655H6.07471V16.966H9.8752V13.1655Z" fill="black" />
        <path
          d="M21.2668 9.36475H17.4663V13.1652H21.2668V9.36475Z"
          fill="black"
        />
        <path
          d="M21.2668 13.1655H17.4663V16.966H21.2668V13.1655Z"
          fill="black"
        />
        <path
          d="M17.4663 20.7614L21.2668 16.9609H17.4663V20.7614Z"
          fill="black"
        />
        <path
          d="M9.8752 16.9609H6.07471V20.7614H9.8752V16.9609Z"
          fill="black"
        />
        <path
          d="M13.6706 5.56445H9.87012V9.36494H13.6706V5.56445Z"
          fill="black"
        />
        <path
          d="M13.6706 16.9609H9.87012V20.7614H13.6706V16.9609Z"
          fill="black"
        />
        <path
          d="M17.4709 5.56445H13.6704V9.36494H17.4709V5.56445Z"
          fill="black"
        />
        <path
          d="M17.4709 16.9609H13.6704V20.7614H17.4709V16.9609Z"
          fill="black"
        />
      </svg>
    </div>
  );
};
