type EventKey = string;
type EventHandler<T = never> = (payload: T) => void;
export type EventMap = Record<EventKey, EventHandler>;
type Bus<E> = Record<keyof E, E[keyof E][]>;

export interface EventBus<T extends EventMap> {
  on<Key extends keyof T>(key: Key, handler: T[Key]): () => void;
  off<Key extends keyof T>(key: Key, handler: T[Key]): void;
  once<Key extends keyof T>(key: Key, handler: T[Key]): void;
  emit<Key extends keyof T>(key: Key, ...payload: Parameters<T[Key]>): void;
}

interface EventBusConfig {
  onError: (...params: unknown[]) => void;
}

export function eventbus<E extends EventMap>(
  config?: EventBusConfig
): EventBus<E> {
  const bus: Partial<Bus<E>> = {};

  const on: EventBus<E>["on"] = (key, handler) => {
    if (bus[key] === undefined) {
      bus[key] = [];
    }

    bus[key]?.push(handler);

    return () => {
      off(key, handler);
    };
  };

  const off: EventBus<E>["off"] = (key, handler) => {
    const index = bus[key]?.indexOf(handler) ?? -1;
    bus[key]?.splice(index >>> 0, 1);
  };

  const once: EventBus<E>["once"] = <Key extends keyof E>(
    key: Key,
    handler: E[Key]
  ) => {
    const handleOnce = (payload: Parameters<E[Key]>[0]) => {
      handler(payload);
      off(key, handleOnce as E[Key]);
    };

    on(key, handleOnce as E[Key]);
  };

  const emit: EventBus<E>["emit"] = (key, payload) => {
    bus[key]?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        config?.onError(e);
      }
    });
  };

  return { on, off, once, emit };
}
