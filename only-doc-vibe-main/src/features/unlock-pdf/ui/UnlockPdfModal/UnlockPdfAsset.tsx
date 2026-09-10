import type { FC } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import unlockPdfAnimation from "@public/assets/lottie/unlock-pdf.lottie?url";

/** Native composition size from `Unlock PDF.lottie` manifest. */
const LOTTIE_WIDTH = 1900;
const LOTTIE_HEIGHT = 759;

export const UnlockPdfAsset: FC = () => {
  return (
    <div
      className="relative min-h-[200px] w-full shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#eef6fb_0%,#fff3e3_100%)] md:min-h-0 md:rounded-[20px]"
      style={{ aspectRatio: `${LOTTIE_WIDTH} / ${LOTTIE_HEIGHT}` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,230,191,0.8),transparent_34%)]" />
      <DotLottieReact
        src={unlockPdfAnimation}
        autoplay
        loop
        layout={{ fit: "fit-height", align: [0.5, 0.5] }}
        renderConfig={{ autoResize: true }}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
};
