import {Constructor} from "@rosection/utils";

type IToken<Value> = string | symbol | Constructor<Value> | Token<Value>;

class Token<T> {
  readonly id: string | symbol;

  constructor(id: string | symbol) {
    this.id = id;
  }

  static from = <Value>(token: IToken<Value>) => {
    if (token instanceof Token) {
      return token;
    }

    switch (typeof token) {
      case "symbol":
      case "string":
        return new Token(token);
      case "function":
        if (token.name) {
          const name = token.name;

          if (!name) {
            throw new Error("Invalid token value");
          }

          return new Token(name);
        }
    }

    throw new Error("Invalid token value");
  };

  match = (token: any) => {
    return this.id === Token.from(token).id;
  };
}

export type {
  IToken,
};

export {
  Token,
};