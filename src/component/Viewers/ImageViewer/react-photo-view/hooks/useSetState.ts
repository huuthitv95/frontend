// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useReducer } from "react";

export default function useSetState<S extends Record<string, any>>(initialState: S) {
  return useReducer(
    (state: S, action: Partial<S> | ((state: S) => Partial<S>)) => ({
      ...state,
      ...(typeof action === "function" ? action(state) : action),
    }),
    initialState,
  );
}
