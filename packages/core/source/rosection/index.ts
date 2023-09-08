import { Mixin } from "ts-mixer";

import { Provider } from "~/provider";

import ExtensionManager from "~/extension";

import { Token, IToken } from "~/token";

class Rosection extends Mixin(ExtensionManager) {
  private readonly store = new Map<string, Provider<unknown>>();

  private has<Value>(token: Token<Value>) {
    return this.store.has(token.value);
  }

  private set<Value>(token: Token<Value>, provider: Provider<Value>) {
    return this.store.set(token.value, provider);
  }

  private get<Value>(token: Token<Value>) {
    return this.store.get(token.value) as Provider<Value> | undefined;
  }

  private parent: Rosection;

  createChild() {
    const child = new Rosection();

    child.parent = this;

    return child;
  }

  //

  register<Value>(token: IToken<Value> | Provider<Value>, provider?: Provider<Value>) {
    if ( token instanceof Provider ) {
      provider = token;
      token = provider.token;
    }

    if ( !(token instanceof Token) ) {
      token = Token.from(token);
    }

    if ( !provider ) {
      throw new Error("Provider not specified");
    }

    if ( this.has(token) ) {
      throw new Error("Token already registered");
    }

    provider.rosection = this;

    this.beforeRegister(token, provider);

    this.set(token, provider);

    if ( provider.register ) {
      provider.register();
    }

    this.afterRegister(token, provider);
  }

  //

  resolve<Value>(token: IToken<Value>): Value {
    if ( !(token instanceof Token) ) {
      token = Token.from(token);
    }

    const provider = this.get(token);

    if ( provider ) {
      this.beforeResolve(token);
      const resolved = provider.resolve();
      this.afterResolve(token, resolved);
      return resolved;
    }

    if ( this.parent ) {
      return this.parent.resolve(token);
    }

    throw new Error("Token not registered");
  }

  resolveOr<Value>(token: IToken<Value>, fallback: Value): Value {
    try {
      return this.resolve(token);
    } catch {
      return fallback;
    }
  }

  //

  dispose<Value>(token: IToken<Value>) {
    if ( !(token instanceof Token) ) {
      token = Token.from(token);
    }

    const provider = this.get(token);

    if ( provider ) {
      this.beforeDispose(token, provider);

      if ( provider.dispose ) {
        provider.dispose();
      }

      this.afterDispose(token, provider);
      this.store.delete(token.value);
    }
  }

  disposeAll() {
    for ( const [token] of this.store ) {
      this.dispose(token);
    }
  }
}

export default Rosection;