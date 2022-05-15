import { renderHook } from "@testing-library/react";
import { TextProvider, useText } from "./useText";
import { ignoreErrors } from "../testHelpers/ignore";
import { copy } from "../copy";
import { ReactNode } from "react";

describe("useText", () => {
  describe("when used without a provider", () => {
    ignoreErrors(
      "RenderHook is still throwing an error inside of render cycle"
    );

    it("should throw an error", () => {
      try {
        const { result } = renderHook(() => useText("welcome"));
        expect(() => result.current).toThrow();
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toMatchInlineSnapshot(`[Error: no provider for useText]`);
      }
    });
  });

  it("should return the appropriate text for a given key", () => {
    const { result } = renderHook(() => useText("welcome"), {
      wrapper: ({ children }) => <TextProvider>{children}</TextProvider>,
    });

    expect(result.current).toBe(copy.welcome);
  });
});
