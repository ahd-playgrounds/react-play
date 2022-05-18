/* eslint-disable jest/no-conditional-expect */
import {
  Action,
  asyncDispatcher,
  Dispatcher,
  dispatchMiddleware,
  initialState,
  reducer,
  State,
  useAboutPage,
  UserAction,
} from "./useAboutPage";
import { act, renderHook } from "@testing-library/react-hooks";
import { FakeProviders } from "../../testHelpers/rtl";
import { IService } from "../../hooks/useServices";
import { IChildren } from "../../types";
import { stubCharacter } from "../../services/rickAndMortyService";
import { merge } from "../../utils";
import { ignoreErrors } from "../../testHelpers/ignore";

interface Test {
  prevState: State;
  event: UserAction;
  nextState: State;
  desc: string;
  getCharacter?: IService["getCharacter"];
  sync?: true;
}

describe("useAboutPage hook test", () => {
  ignoreErrors(
    "Probably just need to downgrade to react 17, or wait for react-testing-library/react to expose the same API as hooks testing lib",
    /Warning: ReactDOM.render is no longer supported in React 18/
  );

  const tests: Test[] = [
    {
      desc: "unknown actions return unchanged state",
      event: { event: "NOPE" } as any,
      prevState: initialState,
      nextState: initialState,
      sync: true,
    },
    {
      desc: "on LOAD event, it transitions to loading",
      event: { event: "LOAD" },
      prevState: initialState,
      nextState: merge(initialState, { loading: true }),
      sync: true,
    },
    {
      desc: "on LOAD, when a service fails, it transitions to error",
      event: { event: "LOAD" },
      prevState: initialState,
      nextState: merge(initialState, { error: true }),
      getCharacter: async () => Promise.reject("oh no!"),
    },
  ];

  test.concurrent.each(tests)(
    "$desc",
    async ({ nextState, prevState, event, getCharacter, sync }) => {
      const { result, waitForNextUpdate, rerender } = renderHook(
        () => useAboutPage(),
        {
          wrapper: ({ children }: IChildren) => (
            <FakeProviders
              services={{
                service: {
                  ...(getCharacter && { getCharacter }),
                },
              }}
            >
              {children}
            </FakeProviders>
          ),
        }
      );

      expect(result.current[0]).toEqual(prevState);

      debugger;

      if (sync) {
        act(() => {
          result.current[1](event);
        });
        rerender();
      } else {
        result.current[1](event);
        await waitForNextUpdate();
      }

      expect(result.current[0]).toEqual(nextState);
    }
  );
});

describe("useAboutPage reducer", () => {
  interface TestR {
    prevState: State;
    event: Action;
    nextState: State;
    desc: string;
    service?: IService;
  }

  const tests: TestR[] = [
    {
      desc: "unknown actions return unchanged state",
      event: { event: "NOPE" } as any,
      prevState: initialState,
      nextState: initialState,
    },
    {
      desc: "on _LOADING event, it transitions to loading",
      event: { event: "_LOADING" },
      prevState: initialState,
      nextState: merge(initialState, { loading: true }),
    },
    {
      desc: "on _ERROR, transitions to error state",
      event: { event: "_ERROR" },
      prevState: initialState,
      nextState: merge(initialState, { error: true }),
    },
    {
      desc: "on _SUCCESS, adds character to data and removes loading",
      event: { event: "_SUCCESS", data: stubCharacter },
      prevState: merge(initialState, { loading: true, error: true }),
      nextState: merge(initialState, {
        error: false,
        loading: false,
        character: stubCharacter,
      }),
    },
  ];

  test.each(tests)("$desc", ({ nextState, prevState, event }) => {
    const s = reducer(prevState, event);
    expect(s).toEqual(nextState);
  });
});

/**
 * IGNORE THIS ONE
 */
describe.skip("useAboutPage middleware", () => {
  test("on a failed request, should transition from loading to error", (done) => {
    const spy = jest.fn();

    const dispatch = dispatchMiddleware(
      (action) => {
        spy(action);
        if (action.event === "_ERROR") {
          expect(spy).toHaveBeenCalledWith<[Action]>({ event: "_LOADING" });
          expect(spy).toHaveBeenCalledWith<[Action]>({ event: "_ERROR" });
          done();
        }
      },
      {
        getCharacter: async () => Promise.reject("hi"),
      }
    );

    expect(dispatch({ event: "LOAD" })).toBeUndefined();
  });

  test("on successful request, should fetch a character", () => {
    return wrapper<UserAction, Action>({
      middleware: (dispatch) =>
        dispatchMiddleware(dispatch, {
          getCharacter: async () => Promise.resolve(stubCharacter),
        }),
      isComplete: ({ event }) => event === "_SUCCESS",
      assertions: (spy) => {
        expect(spy).toHaveBeenCalledWith<[Action]>({ event: "_LOADING" });
        expect(spy).toHaveBeenCalledTimes(2);
      },
      initialEvent: { event: "LOAD" },
    });

    // -----------------------------------------------------------
    // --------- WORKINGS
    // -----------------------------------------------------------
    function wrapper<B, A = any>({
      middleware,
      isComplete,
      assertions,
      initialEvent,
    }: {
      middleware: (arg: Dispatcher<A>) => Dispatcher<B>;
      isComplete: (e: A) => boolean;
      assertions: (spy: jest.Mock<void, [A]>) => void;
      initialEvent: B;
    }) {
      return new Promise((resolve) => {
        const spy = jest.fn();

        const dispatch = middleware((a) => {
          spy(a);
          if (isComplete(a)) {
            assertions(spy);
            resolve(undefined);
          }
        });

        dispatch(initialEvent);
      });
    }
  });

  test("2 on successful request, should fetch a character", () => {
    const tester = testHarness(dispatchMiddleware);
    return tester({
      isComplete: ({ event }) => event === "_SUCCESS",
      assertions: (spy) => {
        expect(spy).toHaveBeenCalledWith<[Action]>({ event: "_LOADING" });
        expect(spy).toHaveBeenCalledTimes(2);
      },
      initialEvent: { event: "LOAD" },
    });

    // -----------------------------------------------------------
    // --------- WORKINGS
    // -----------------------------------------------------------

    // export function dispatchMiddleware(     dispatch: Dispatcher<Action>,     service: IService): (action: UserAction) => void

    type First<T> = T extends (
      dispatch: (a: infer FirstArgument) => void,
      second: any
    ) => (dispatch: any) => void
      ? FirstArgument
      : never;

    type Second<T> = T extends (
      dispatch: any,
      second: any
    ) => (dispatch: infer SecondArgument) => void
      ? SecondArgument
      : never;

    type X = First<typeof dispatchMiddleware>;
    type Y = Second<typeof dispatchMiddleware>;

    function testHarness<A extends (args: any, b: any) => any>(middleware: A) {
      return ({
        isComplete,
        assertions,
        initialEvent,
      }: {
        isComplete: (e: First<A>) => boolean;
        assertions: (spy: jest.Mock<void, [First<A>]>) => void;
        initialEvent: Second<A>;
      }): Promise<void> => {
        return new Promise((resolve) => {
          const spy = jest.fn();

          const dispatch = middleware((a) => {
            spy(a);
            if (isComplete(a)) {
              assertions(spy);
              resolve(undefined);
            }
          });

          dispatch(initialEvent);
        });
      };
    }
  });
});

describe("useAboutPage async middleware", () => {
  test("on a failed request, should transition from loading to error", async () => {
    const spy = jest.fn();

    await asyncDispatcher({
      getCharacter: async () => Promise.reject("hi"),
    })(spy)({ event: "LOAD" });

    expect(spy).toHaveBeenCalledWith<[Action]>({ event: "_LOADING" });
    expect(spy).toHaveBeenCalledWith<[Action]>({ event: "_ERROR" });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
