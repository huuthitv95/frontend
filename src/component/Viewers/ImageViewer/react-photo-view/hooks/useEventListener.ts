// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useEffect, useRef } from "react";

export default function useEventListener<K extends keyof WindowEventMap>(
  type: K | undefined,
  fn: (evt: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  const latest = useRef(fn);
  latest.current = fn;

  useEffect(() => {
    function wrapper(evt: WindowEventMap[K]) {
      latest.current(evt);
    }
    if (type) {
      window.addEventListener(type, wrapper, options);
    }
    return () => {
      if (type) {
        window.removeEventListener(type, wrapper);
      }
    };
  }, [type]);
}
