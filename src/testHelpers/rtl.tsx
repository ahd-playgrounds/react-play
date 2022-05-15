import React from "react";
import merge from "lodash.merge";
import { render, RenderOptions } from "@testing-library/react";
import { IProviders, Providers } from "../components/Providers";

type ProviderArgs = Omit<IProviders, "children">;
interface Options {
  renderOptions?: Omit<RenderOptions, "queries">;
  providerOverrides?: DeepPartial<ProviderArgs>;
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export function renderPage(ui: React.ReactElement, options?: Options) {
  const { renderOptions, providerOverrides } = options ?? {};

  const fakes: ProviderArgs = {
    services: {
      service: {
        async getCharacter(id?: string) {
          return Promise.resolve("hi");
        },
      },
    },
  };

  const view = render(ui, {
    wrapper: ({ children }) => (
      <Providers {...merge({}, fakes, providerOverrides)}>{children}</Providers>
    ),
    ...renderOptions,
  });

  return {
    view,
  };
}
