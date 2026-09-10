export const OS_MAP: Record<string, string> = {
  win: "Windows",
  mac: "macOS",
  linux: "Linux",
  android: "Android",
  iphone: "iOS",
  ipad: "iOS",
  ipod: "iOS",
};

export const getUserPlatform = (): string => {
  // Try modern API first, fallback to userAgent for older browsers
  let platform: string | undefined;

  if (
    "userAgentData" in navigator &&
    (navigator.userAgentData as unknown as { platform: string })?.platform
  ) {
    platform = (navigator.userAgentData as unknown as { platform: string })
      .platform;
  } else {
    // Fallback for older browsers - parse userAgent
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) platform = "win";
    else if (userAgent.includes("Mac")) platform = "mac";
    else if (userAgent.includes("Linux")) platform = "linux";
    else if (userAgent.includes("Android")) platform = "android";
    else if (
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad") ||
      userAgent.includes("iPod")
    )
      platform = "iphone";
  }

  if (!platform) {
    return "Unknown";
  }

  const foundKey = Object.keys(OS_MAP).find((key) =>
    platform!.toLowerCase().includes(key)
  );

  return foundKey && foundKey in OS_MAP ? OS_MAP[foundKey] : "Unknown";
};
