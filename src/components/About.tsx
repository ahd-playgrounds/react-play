import { useText } from "../hooks/useText";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { IChildren } from "../types";
import { IService, useServices } from "../hooks/useServices";

type Action = { event: "LOAD" } | { event: "_ERROR" } | { event: "_LOADING" };

interface State {
  loading: boolean;
  error: boolean;
  count: number;
}

const initialState: State = {
  loading: false,
  error: false,
  count: 0,
};

type Dispatcher = (action: Action) => void;

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.event) {
    case "_LOADING":
      return { ...state, loading: true };
    case "_ERROR":
      return { ...state, loading: false, error: true };
    default:
      return { ...state };
  }
};

function dispatchMiddleware(dispatch: Dispatcher, service: IService) {
  return (action: Action) => {
    switch (action.event) {
      case "LOAD":
        service.getCharacter().catch(() => {
          dispatch({ event: "_ERROR" });
        });
        dispatch({ event: "_LOADING" });
        break;
      default:
        dispatch(action);
        break;
    }
  };
}

type BackendContext = [State, Dispatcher];
const backendContext = createContext<BackendContext | null>(null);
const useBackend = () => {
  const c = useContext(backendContext);
  if (!c) throw new Error("no backend");
  return c;
};

interface IBackendProvider extends IChildren {
  service: IService;
}

function BackendProvider({ children, service }: IBackendProvider) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <backendContext.Provider
      value={[state, dispatchMiddleware(dispatch, service)]}
    >
      {children}
    </backendContext.Provider>
  );
}

export function About() {
  const services = useServices();
  return (
    <BackendProvider service={services.service}>
      <AboutPage />
    </BackendProvider>
  );
}

function ErrorPage() {
  const { body, heading, tryAgainButton } = useText("error");
  return (
    <div>
      <h2>{heading}</h2>
      <p>{body}</p>
    </div>
  );
}

function AboutPage() {
  const welcome = useText("welcome");
  const [state, dispatch] = useBackend();

  if (state.error) {
    return <ErrorPage />;
  }
  if (state.loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1>{welcome.h1}</h1>
      <h2>{welcome.heading}</h2>
      <button
        type="button"
        onClick={() => {
          dispatch({ event: "LOAD" });
        }}
      >
        {welcome.loadCharacterButton}
      </button>
    </div>
  );
}

function Loading() {
  const { body } = useText("loading");
  return (
    <div>
      <p>{body}</p>
    </div>
  );
}
