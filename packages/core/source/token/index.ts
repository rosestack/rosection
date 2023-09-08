import { Constructor } from "@rosection/utils";

type IToken<Value> = string | number | boolean | bigint | Constructor<Value> | Token<Value>;

class Token<T extends unknown> {
  public readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  static from = <Value>(value: IToken<Value>): Token<Value> => {
    if ( value instanceof Token ) {
      return value;
    }

    switch ( typeof value ) {
      case "symbol":
      case "string":
      case "number":
      case "boolean":
      case "bigint":
        return new Token(String(value));
      case "function":
        if ( value.name ) {
          const name = value.name;

          if ( !name ) {
            throw new Error("Invalid token value");
          }

          return new Token(name);
        }
    }

    throw new Error("Invalid token value");
  };

  match = <Value>(token: IToken<Value>): boolean => {
    return this.value === Token.from(token).value;
  };
}

export type {
  IToken,
};

export {
  Token,
};