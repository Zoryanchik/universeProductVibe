"use client";

import { useEffect } from "react";

import { identifyAnalyticsUser, initAnalytics } from "@/shared/lib/analytics";

import { useUserStore } from "@/entities/user";

export const AnalyticsIniter = () => {
  const user = useUserStore.use.user();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!user) return;

    identifyAnalyticsUser({
      id: user.id,
      email: user.email,
      status: user.status,
      countryCode: user.countryCode,
    });
  }, [user]);

  return null;
};
