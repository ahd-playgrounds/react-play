import { createContext, useContext } from "react";
import { copy } from "../copy";
import { IChildren } from "../types";

type Copy = typeof copy;

const textContext = createContext<Copy | null>(null);

interface ITextProvider extends IChildren {}

export function TextProvider({ children }: ITextProvider) {
  return <textContext.Provider value={copy}>{children}</textContext.Provider>;
}

type Key = keyof Copy;

export function useText<K extends Key>(contentKey: K): Copy[K] {
  const context = useContext(textContext);
  if (!context) throw new Error("no provider for useText");
  return context[contentKey];
}
