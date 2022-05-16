import { createContext, useContext } from "react";
import { IChildren } from "../types";
import { ICharacter } from "../services/rickAndMortyService";

export interface IService {
  getCharacter(id?: string): Promise<ICharacter>;
}

export interface IServicesProvider extends IChildren {
  services: {
    service: IService;
  };
}

const serviceContext = createContext<{ service: IService } | null>(null);
export function useServices() {
  const s = useContext(serviceContext);
  if (!s) throw new Error("no provider for services");
  return s;
}

export function ServiceProvider({ children, services }: IServicesProvider) {
  return (
    <serviceContext.Provider value={services}>
      {children}
    </serviceContext.Provider>
  );
}
