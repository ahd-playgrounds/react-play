import { IService } from "../hooks/useServices";

export const rickAndMortyService: IService = {
  getCharacter(id?: string) {
    throw new Error("not yet implemented");
  },
};

export const fakeRickAndMortyService: IService = {
  getCharacter(id?: string) {
    return Promise.resolve(stubCharacter);
  },
};

export interface ICharacter {
  name: string;
}

export const stubCharacter: ICharacter = {
  name: "Morty",
};
