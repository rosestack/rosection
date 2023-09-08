import { Provider, Token } from "rosection";

import { Constructor } from "@rosection/utils";

import { onRegisterMetadata, onResolveMetadata, onDisposeMetadata, parameterMetadata } from "~/utils/metadata";

enum ClassScope {
  Singleton = "singleton",
  Transient = "transient",
}

interface ClassProviderOptions<Value> {
  constructor: Constructor<Value>;
  scope?: ClassScope;
  onDispose?: (instance: Value) => void;
}

class ClassProvider<Value> extends Provider<Value> {
  private instance?: any;

  constructor(public provider: ClassProviderOptions<Value>) {
    super();
  }

  get token(): Token<Value> {
    return Token.from(this.provider.constructor);
  }

  register() {
    const { constructor } = this.provider;

    const registers = onRegisterMetadata.get(constructor) || [];

    for ( const register of registers ) {
      register.callback(this.rosection);
    }
  }

  resolve() {
    if ( this.instance ) {
      return this.instance;
    }

    const { constructor } = this.provider;

    const staticResolves = onResolveMetadata.get(constructor) || [];

    for ( const resolve of staticResolves ) {
      resolve.callback(this.rosection, undefined);
    }

    const args: any[] = [];

    parameterMetadata.get(constructor)?.forEach((parameter) => {
      const { index, token, optional } = parameter;

      if ( optional ){
        args[index] = this.rosection.resolveOr(token, undefined);
      } else {
        args[index] = this.rosection.resolve(token);
      }
    });

    const instance = new (constructor as Constructor<any>)(...args);

    const resolves = onResolveMetadata.get(instance) || [];

    for ( const resolve of resolves ) {
      resolve.callback(this.rosection, instance);
    }

    if ( this.provider.scope === ClassScope.Singleton ) {
      this.instance = instance;
    }

    return instance;
  }

  dispose() {
    const staticDisposers = onDisposeMetadata.get(this.provider.constructor) || [];

    for ( const disposer of staticDisposers ) {
      disposer.callback(this.rosection, undefined);
    }

    const instance = this.resolve();

    const disposers = onDisposeMetadata.get(instance) || [];

    for ( const disposer of disposers ) {
      disposer.callback(this.rosection, instance);
    }

    if ( this.provider.onDispose ) {
      this.provider.onDispose(instance);
    }
  }
}

const useClass = <Value>(options: ClassProviderOptions<Value>) => {
  return new ClassProvider<Value>({
    scope: ClassScope.Singleton,
    ...options,
  });
};

export {
  ClassScope,
};

export {
  ClassProvider,
  useClass,
};