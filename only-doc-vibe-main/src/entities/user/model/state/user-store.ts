import { create } from "zustand";
import type { ECountryCode } from "@universe-forma/global-types";

import { createSelectors } from "@/shared/lib/state/createSelectors";

import type { EUserStatus } from "../constants/user-status";
import type { IUser } from "../types";
import { UserStorage } from "./user-storage";

interface IUserStore {
  user: IUser | null;
  isOrganicUser: boolean;
  userCountry: ECountryCode | null;
  isUserLoading: boolean;
}

const getInitialState = () => {
  return {
    isOrganicUser: UserStorage.getIsOrganicUser(),
    user: UserStorage.getUser(),
    isUserLoading: false,
    userCountry: UserStorage.getUserCountry(),
  };
};

const userStore = create<IUserStore>(() => getInitialState());

export const setUser = (user: IUser) => {
  userStore.setState({ user });
  UserStorage.setUser(user);
  UserStorage.setUserId(user.id);
};

export const setIsOrganicUser = (isOrganicUser: boolean) => {
  userStore.setState({ isOrganicUser });
  UserStorage.setIsOrganicUser(isOrganicUser);
};

export const setIsUserLoading = (isUserLoading: boolean) => {
  userStore.setState({ isUserLoading });
};

export const setUserCountry = (country: ECountryCode) => {
  userStore.setState({ userCountry: country });
  UserStorage.setUserCountry(country);
};

export const setUserStatus = (status: EUserStatus) => {
  userStore.setState((prev) => ({
    ...prev,
    user: prev.user ? { ...prev.user, status } : null,
  }));

  const user = userStore.getState().user;

  if (!user) return;

  UserStorage.setUser({ ...user, status });
};

export const setUserEmail = (email: string) => {
  userStore.setState((prev) => ({
    ...prev,
    user: prev.user ? { ...prev.user, email } : null,
  }));

  const user = userStore.getState().user;

  if (!user) return;

  UserStorage.setUser({ ...user, email });
};

export const clearUser = () => {
  userStore.setState((prev) => ({
    user: null,
    isOrganicUser: prev.isOrganicUser,
  }));
  UserStorage.clearAll();
};

export const useUserStore = createSelectors(userStore);
