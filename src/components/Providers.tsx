import { TextProvider } from "../hooks/useText";
import React from "react";
import { IServicesProvider, ServiceProvider } from "../hooks/useServices";

export interface IProviders extends IServicesProvider {}

export function Providers({ children, services }: IProviders) {
  return (
    <ServiceProvider services={services}>
      <TextProvider>
        <div>{children}</div>
      </TextProvider>
    </ServiceProvider>
  );
}
