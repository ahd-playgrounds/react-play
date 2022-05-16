import React from "react";
import merge from "lodash.merge";
import { render, RenderOptions } from "@testing-library/react";
import { IProviders, Providers } from "../components/Providers";
import { IChildren } from "../types";
import { fakeRickAndMortyService } from "../services/rickAndMortyService";

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

  const view = render(ui, {
    wrapper: ({ children }) => (
      <FakeProviders {...providerOverrides}>{children}</FakeProviders>
    ),
    ...renderOptions,
  });

  return {
    view,
  };
}

export function FakeProviders(props: DeepPartial<ProviderArgs> & IChildren) {
  const { children, services } = props;

  const fakes: ProviderArgs = {
    services: {
      service: fakeRickAndMortyService,
    },
  };

  return <Providers {...merge({}, fakes, { services })}>{children}</Providers>;
}
