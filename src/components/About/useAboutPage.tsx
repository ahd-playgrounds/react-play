import React, { useReducer } from "react";
import { IService, useServices } from "../../hooks/useServices";
import { ICharacter } from "../../services/rickAndMortyService";

export type Action = InternalAction | UserAction;

export type UserAction = {
  event: "LOAD";
};

type InternalAction =
  | { event: "_ERROR" }
  | { event: "_LOADING" }
  | { event: "_SUCCESS"; data: ICharacter };

export interface State {
  loading: boolean;
  error: boolean;
  count: number;
  character?: ICharacter;
}

export const initialState: State = {
  loading: false,
  error: false,
  count: 0,
};

export const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.event) {
    case "_LOADING":
      return { ...state, loading: true };
    case "_ERROR":
      return { ...state, loading: false, error: true };
    case "_SUCCESS":
      return { ...state, loading: false, error: false, character: action.data };
    default:
      return { ...state };
  }
};

export type Dispatcher<A> = (action: A) => void;

export function dispatchMiddleware(
  dispatch: Dispatcher<Action>,
  service: IService
) {
  return (action: UserAction) => {
    switch (action.event) {
      case "LOAD":
        dispatch({ event: "_LOADING" });
        service
          .getCharacter()
          .then((data) => {
            dispatch({ event: "_SUCCESS", data });
          })
          .catch(() => {
            dispatch({ event: "_ERROR" });
          });
        break;
      default:
        dispatch(action);
        break;
    }
  };
}

type AboutContext = [state: State, dispatch: Dispatcher<UserAction>];

export const useAboutPage = (initial = initialState): AboutContext => {
  const services = useServices();
  const [state, dispatch] = useReducer(reducer, initialState);
  return [state, dispatchMiddleware(dispatch, services.service)];
};
