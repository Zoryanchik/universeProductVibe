import { useEffect, type FC } from "react";
import { SW_BASE } from "astro:env/client";

import { getCurrentLanguage } from "@/shared/lib/translations/getCurrentLanguage";

interface ServiceWorkerProps {
  onUpdateAvailable?: () => void;
  onUpdateInstalled?: () => void;
}

const WORKER_BASE = SW_BASE || "";

export const ServiceWorkerIniter: FC<ServiceWorkerProps> = ({
  onUpdateAvailable,
  onUpdateInstalled,
}) => {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          `${WORKER_BASE}/sw.js?lang=${getCurrentLanguage()}`,
          {
            scope: `${WORKER_BASE}/`,
          }
        );

        console.log("Service Worker registered successfully:", registration);

        // Обробка оновлень service worker
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // Нова версія доступна
                  console.log("New service worker version available");
                  onUpdateAvailable?.();
                  // Відправляємо повідомлення для показу UI оновлення
                  window.postMessage({ type: "SW_UPDATE_AVAILABLE" }, "*");
                } else {
                  // Service worker встановлений вперше
                  console.log("Service worker installed for the first time");
                  onUpdateInstalled?.();
                }
              }
            });
          }
        });

        // Обробка контролю service worker
        let hadController = !!navigator.serviceWorker.controller;

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (hadController) {
            window.location.reload(); // update case
          } else {
            hadController = true; // first install, no reload
          }
        });

        // Перевірка наявності оновлень
        await registration.update();
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    // Реєструємо service worker тільки після завантаження сторінки
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    // Функція для примусового оновлення service worker
    const updateServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
    };

    // Додаємо функцію до глобального об'єкта для можливості виклику з консолі
    window.updateServiceWorker = updateServiceWorker;
  }, [onUpdateAvailable, onUpdateInstalled]);

  return null;
};
