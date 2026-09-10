import { LOCAL_STORAGE_KEYS } from "../../constants/local-storage-keys";
import { getIsClient } from "../utils/getIsClient";

const isLocalStorageAvailable = (): boolean => {
  try {
    if (!getIsClient()) return false;

    localStorage.setItem(LOCAL_STORAGE_KEYS.TEST_KEY, "true");
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TEST_KEY);

    return true;
  } catch {
    return false;
  }
};

class AppStorage {
  private readonly varKey: string = "app_storage";
  private readonly isLocalStorageAvailable: boolean = isLocalStorageAvailable();

  public setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable) {
      this.storeToLS(key, value);

      return;
    }

    this.storeToWindow(key, value);
  }

  public getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      return this.getFromLS(key);
    }

    return this.getFromWindow(key);
  }

  public removeItem(key: string): void {
    if (this.isLocalStorageAvailable) {
      this.removeFromLS(key);

      return;
    }

    this.removeFromWindow(key);
  }

  private storeToLS(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private storeToWindow<T>(key: string, value: T): void {
    window[this.varKey as keyof Window][key] = value;
  }

  private getFromLS(key: string): string | null {
    return localStorage.getItem(key);
  }

  private getFromWindow(key: string): string | null {
    if (
      typeof window !== "undefined" &&
      key in window[this.varKey as keyof Window]
    ) {
      return `${window[this.varKey as keyof Window][key]}`;
    }

    return null;
  }

  private removeFromLS(key: string): void {
    localStorage.removeItem(key);
  }

  private removeFromWindow(key: string): void {
    delete window[this.varKey as keyof Window][key];
  }
}

export const appStorage = new AppStorage();
