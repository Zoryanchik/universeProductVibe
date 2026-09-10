import { useId, useMemo } from "react";

interface UsePrimaryButtonGlowParams {
  readonly showGlow: boolean;
}

interface UsePrimaryButtonGlowReturn {
  readonly glowId: string;
  readonly glowAnimationStyles: string;
  readonly glowClassName: string;
}

export const usePrimaryButtonGlow = ({
  showGlow,
}: UsePrimaryButtonGlowParams): UsePrimaryButtonGlowReturn => {
  const uniqueId = useId();
  const glowId = `rainbow-glow-${uniqueId.replace(/:/g, "")}`;

  const { glowAnimationStyles, glowClassName } = useMemo(() => {
    if (!showGlow) {
      return { glowAnimationStyles: "", glowClassName: "inline-flex" };
    }

    const styles = `
      @keyframes rainbow-slide-${glowId} {
        0% {
          background-position: 150% 0;
        }
        100% {
          background-position: -50% 0;
        }
      }
      .${glowId} {
        position: relative;
        display: inline-flex;
      }
      .${glowId}::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 20px;
        background: 
          linear-gradient(
            90deg,
            transparent 0%,
            var(--lime-A100, rgba(244, 255, 129, 0.70)) 15%,
            var(--teal-A100, rgba(167, 255, 235, 0.70)) 28%,
            var(--red-A100, rgba(255, 138, 128, 0.70)) 42%,
            var(--lightGreen-A100, rgba(204, 255, 144, 0.70)) 56%,
            var(--cyan-A100, rgba(132, 255, 255, 0.70)) 70%,
            var(--purple-A100, rgba(234, 128, 252, 0.70)) 85%,
            transparent 100%
          );
        background-size: 200% 100%;
        filter: blur(10px);
        z-index: -1;
        opacity: 0.9;
        animation: rainbow-slide-${glowId} 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
    `;

    return { glowAnimationStyles: styles, glowClassName: glowId };
  }, [showGlow, glowId]);

  return { glowId, glowAnimationStyles, glowClassName };
};
