import { DeepPartial } from "./testHelpers/rtl";
import _merge from "lodash.merge";

/**
 * Create a new object where later arguments override the deeply set previous values
 * @example
 * // returns { a: 1, b: 99, c: { x: 1, y: 77 } }
 * merge(
 *   { a: 1, b: 2, c: { x: 1, y: 2 } },
 *   { b: 99, c: { y: 77  } }
 * );
 */
export function merge<A, B extends DeepPartial<A> | undefined>(
  a: A,
  ...b: B[]
): A {
  return _merge({}, a, ...b);
}
