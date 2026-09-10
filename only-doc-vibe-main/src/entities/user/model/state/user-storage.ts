import { isCountryCode, type ECountryCode } from "@universe-forma/global-types";
import Cookies from "js-cookie";

import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage-keys";
import { appStorage } from "@/shared/lib/storage/app-storage";
import { COOKIES_KEYS } from "@/shared/constants/cookies-keys";

import type { IUser } from "../types";

export const UserStorage = {
  getUser: (): IUser | null => {
    try {
      const user = appStorage.getItem(LOCAL_STORAGE_KEYS.USER);

      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: IUser) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  },
  clearUser: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  },

  getUserId: (): string | null => {
    return Cookies.get(COOKIES_KEYS.USER_ID) || null;
  },
  setUserId: (userId: string) => {
    Cookies.set(COOKIES_KEYS.USER_ID, userId);
  },
  clearUserId: () => {
    Cookies.remove(COOKIES_KEYS.USER_ID);
  },

  getUserCountry: (): ECountryCode | null => {
    const country = appStorage.getItem(LOCAL_STORAGE_KEYS.USER_COUNTRY);

    if (isCountryCode(country)) {
      return country;
    }

    return null;
  },
  setUserCountry: (country: ECountryCode) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.USER_COUNTRY, country);
  },
  clearUserCountry: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.USER_COUNTRY);
  },

  getIsOrganicUser: () => {
    const organicUserValue = appStorage.getItem(
      LOCAL_STORAGE_KEYS.IS_ORGANIC_USER
    );

    return organicUserValue === "true";
  },
  setIsOrganicUser: (isOrganicUser: boolean) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.IS_ORGANIC_USER,
      String(isOrganicUser)
    );
  },

  clearAll: () => {
    UserStorage.clearUser();
    UserStorage.clearUserId();
  },
};
