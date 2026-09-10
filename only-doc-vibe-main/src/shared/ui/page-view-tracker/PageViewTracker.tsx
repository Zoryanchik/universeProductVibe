"use client";

import { useEffect } from "react";

import {
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsEventProperties,
} from "../../lib/analytics";

interface PageViewTrackerProps {
  readonly eventName: AnalyticsEventName;
  readonly eventProperties?: AnalyticsEventProperties;
}

export const PageViewTracker = ({
  eventName,
  eventProperties,
}: PageViewTrackerProps) => {
  useEffect(() => {
    trackEvent(eventName, eventProperties);
  }, [eventName, eventProperties]);

  return null;
};
