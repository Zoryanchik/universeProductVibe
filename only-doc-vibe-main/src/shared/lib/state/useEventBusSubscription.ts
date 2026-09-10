import { useEffect } from "react";

import type { EventBus, EventMap } from "./eventBus";
import useEventCallback from "./useEventCallback";

export const useEventBusSubscription = <
  T extends EventMap,
  Key extends keyof T,
>(
  eventBus: EventBus<T>,
  key: Key,
  handler: T[Key]
) => {
  const handlerCb = useEventCallback(handler);

  useEffect(() => {
    const handler: T[Key] = ((...args) => handlerCb(...args)) as T[Key];

    eventBus.on(key, handler);

    return () => {
      eventBus.off(key, handler);
    };
  }, [eventBus, key, handlerCb]);
};
