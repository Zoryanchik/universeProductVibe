import { create } from "zustand";

export type ToastType = "success" | "error" | "info";
export type ToastPosition = "bottom" | "top";
export type ToastIcon = "link" | "info" | "check" | "mail" | "alert";

export interface IToastAction {
  label: string;
  onClick: () => void;
}

export interface IToast {
  id: string;
  message: string;
  subtitle?: string;
  type: ToastType;
  position: ToastPosition;
  duration: number;
  icon?: ToastIcon;
  action?: IToastAction;
}

interface IToastStore {
  toasts: IToast[];
}

const toastStore = create<IToastStore>()(() => ({ toasts: [] }));

let _nextId = 1;

export interface ShowToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  icon?: ToastIcon;
  subtitle?: string;
  action?: IToastAction;
}

export const showToast = (
  message: string,
  opts: ShowToastOptions = {}
): string => {
  const id = String(_nextId++);
  const toast: IToast = {
    id,
    message,
    type: opts.type ?? "success",
    position: opts.position ?? "bottom",
    duration: opts.duration ?? 4000,
    icon: opts.icon,
    subtitle: opts.subtitle,
    action: opts.action,
  };
  toastStore.setState((s) => ({ toasts: [...s.toasts, toast] }));

  return id;
};

export const dismissToast = (id: string): void => {
  toastStore.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
};

export const useToastStore = toastStore;
