import {Provider, Token} from "rosection";

import {Constructor, metadata} from "@rosection/utils";

import {onRegisterMetadata, onResolveMetadata, onDisposeMetadata, parameterMetadata} from "~/utils/metadata";

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
  private instance: Value;

  constructor(public provider: ClassProviderOptions<Value>) {
    super();
  }

  get token(): Token<Value> {
    return Token.from(this.provider.constructor);
  }

  register() {
    const {constructor} = this.provider;

    constructor.prototype.rosection = this.rosection;

    const registers = onRegisterMetadata.get(constructor) || [];

    for (const register of registers) {
      register.callback(this.rosection);
    }
  }

  resolve() {
    if (this.instance) {
      return this.instance;
    }

    const {constructor} = this.provider;

    const resolves = onResolveMetadata.get(constructor) || [];

    for (const resolve of resolves.filter((resolve) => resolve.static)) {
      resolve.callback(this.rosection, undefined);
    }

    const args: unknown[] = [];

    const parameters = parameterMetadata.get(constructor) || [];

    for (const parameter of parameters) {
      const {index, token, optional} = parameter;

      if (optional) {
        args[index] = this.rosection.resolveOr(token, undefined);
      } else {
        args[index] = this.rosection.resolve(token);
      }
    }

    const instanceParameters = metadata.getParamTypes(constructor) ?? [];

    console.log(instanceParameters);

    for (const [index, parameter] of instanceParameters.entries()) {
      if (parameters.some((parameter) => parameter.index === index)) {
        continue;
      }

      args[index] = this.rosection.resolveOr(parameter, undefined);
    }

    const instance = new (constructor as Constructor<any>)(...args);

    for (const resolve of resolves.filter((resolve) => !resolve.static)) {
      resolve.callback(this.rosection, instance);
    }

    if (this.provider.scope === ClassScope.Singleton) {
      this.instance = instance;
    }

    return instance;
  }

  dispose() {
    const disposers = onDisposeMetadata.get(this.provider.constructor) || [];

    for (const disposer of disposers.filter((disposer) => disposer.static)) {
      disposer.callback(this.rosection, undefined);
    }

    const instance = this.resolve();

    for (const disposer of disposers.filter((disposer) => !disposer.static)) {
      disposer.callback(this.rosection, instance);
    }

    if (this.provider.onDispose) {
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