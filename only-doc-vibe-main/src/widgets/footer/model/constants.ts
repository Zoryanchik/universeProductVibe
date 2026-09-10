import type { FC, SVGProps } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "../ui/social/SocialIcons";

interface SocialIconProps extends SVGProps<SVGSVGElement> {
  readonly size?: number;
}

export interface ISocialLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly Icon: FC<SocialIconProps>;
  readonly inset: boolean;
}

export const SOCIAL_LINKS: readonly ISocialLink[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/onlydoc",
    Icon: LinkedInIcon,
    inset: false,
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCe0hbUoNFAu4NmWhhc-ROxg",
    Icon: YouTubeIcon,
    inset: false,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/people/OnlyDoc/61589894421545/",
    Icon: FacebookIcon,
    inset: true,
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/onlydoc_web",
    Icon: XIcon,
    inset: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/onlydoc_official",
    Icon: InstagramIcon,
    inset: true,
  },
];
