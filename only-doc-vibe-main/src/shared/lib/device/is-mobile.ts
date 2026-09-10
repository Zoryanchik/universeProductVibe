const UA_MOBILE_REGEX =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;

// Screens whose smallest dimension is below this are treated as phones (vs tablets).
const MOBILE_MAX_MIN_DIMENSION = 768;

const detect = (): boolean => {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  if (UA_MOBILE_REGEX.test(ua)) return true;

  // Fallback for UAs that don't match (and to distinguish tablets): a touch
  // device (coarse pointer, no hover) with a small screen is a phone. iPadOS
  // reports a desktop UA but has a large screen, so it stays non-mobile here.
  const coarsePointer =
    window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const noHover = window.matchMedia?.("(hover: none)").matches ?? false;

  if (coarsePointer && noHover) {
    const minDimension = Math.min(window.screen.width, window.screen.height);

    return minDimension < MOBILE_MAX_MIN_DIMENSION;
  }

  return false;
};

let cached: boolean | null = null;

/**
 * Detects whether the current device is a phone. Evaluated lazily and cached,
 * so it is safe to call during render (returns `false` during SSR).
 */
export const isMobileDevice = (): boolean => {
  if (cached === null) cached = detect();

  return cached;
};
