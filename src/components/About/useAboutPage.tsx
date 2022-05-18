import React, { Reducer, useCallback, useReducer } from "react";
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

export const useAboutPage2 = (initial = initialState): AboutContext => {
  const services = useServices();
  const [state, dispatch] = useReducer(reducer, initialState);

  // services should never change, but adding just in case
  const wrappedDispatch = useCallback(
    dispatchMiddleware(dispatch, services.service),
    [services.service]
  );

  return [state, wrappedDispatch];
};

/// async
function useAsyncReducer<S, A, Au, R extends React.Reducer<S, Au>>(
  reducer: R,
  initial: S,
  middleware: (dispatch: React.Dispatch<Au>) => (a: A) => void
): [S, (a: A) => void] {
  const [state, dispatch] = useReducer(
    reducer as React.Reducer<S, Au>,
    initial
  );
  const d = useCallback(middleware(dispatch), []);
  return [state, d];
}

export const useAboutPage = (initial = initialState) => {
  const services = useServices();
  return useAsyncReducer(reducer, initial, asyncDispatcher(services.service));
};

type AsyncDispatcher<A, B> = (
  dispatch: React.Dispatch<B>
) => (action: A) => Promise<void>;

export function asyncDispatcher(
  service: IService
): AsyncDispatcher<UserAction, Action> {
  return (dispatch) => async (action) => {
    switch (action.event) {
      case "LOAD":
        dispatch({ event: "_LOADING" });
        try {
          const data = await service.getCharacter();
          dispatch({ event: "_SUCCESS", data });
        } catch (e) {
          dispatch({ event: "_ERROR" });
        }
        break;
      default:
        dispatch(action);
        break;
    }
  };
}
