// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useEffect, useRef } from "react";

const useMountedRef = () => {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return mountedRef;
};

export default useMountedRef;
