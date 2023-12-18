import Rosection from "~/rosection";

import { Token } from "~/token";

abstract class Provider<Value> {
  rosection: Rosection;

  abstract get token(): Token<unknown>;

  abstract resolve(): Value;

  abstract register?(): void;

  abstract dispose?(): void;
}

export {
  Provider,
};