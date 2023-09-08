import rosection, { IToken, Token, Rosection } from "rosection";

import { metadata } from "@rosection/utils";

import { useClass } from "~/provider";

import { getDecoratorType, DecoratorType } from "~/utils/decorators";

import { onRegisterMetadata, onResolveMetadata, onDisposeMetadata, parameterMetadata } from "~/utils/metadata";
import { createHash } from "crypto";

class InitDecoratorContext {
  name: string;
  target: any;
  propertyKey?: any;
  descriptor?: any;

  get type() {
    return getDecoratorType(this.target, this.propertyKey, this.descriptor);
  }

  get displayName() {
    return `@${this.name[0]!.toUpperCase()}${this.name.slice(1)}`;
  }
}

class RegisterDecoratorContext extends InitDecoratorContext {
  rosection: Rosection;

  static from(context: InitDecoratorContext) {
    const registerDecoratorContext = new RegisterDecoratorContext();
    Object.assign(registerDecoratorContext, context);
    return registerDecoratorContext;
  }
}

class ResolveDecoratorContext extends InitDecoratorContext {
  rosection: Rosection;
  instance: any;

  static from(context: InitDecoratorContext) {
    const resolveDecoratorContext = new ResolveDecoratorContext();
    Object.assign(resolveDecoratorContext, context);
    return resolveDecoratorContext;
  }

  defineParameter(token: IToken<unknown>, optional?: boolean) {
    if ( typeof this.descriptor !== "number" ) {
      throw new Error("Could not define parameter");
    }

    const parameters = parameterMetadata.get(this.target, this.propertyKey) || [];

    parameters.push({
      token,
      index: this.descriptor,
      optional,
    });

    parameterMetadata.set(parameters, this.target, this.propertyKey);
  }
}

class DisposeDecoratorContext extends InitDecoratorContext {
  rosection: Rosection;
  instance: any;

  static from(context: InitDecoratorContext) {
    const disposeDecoratorContext = new DisposeDecoratorContext();
    Object.assign(disposeDecoratorContext, context);
    return disposeDecoratorContext;
  }
}

type DecoratorCallback = (...args: any[]) => {
  on?: DecoratorType[];
  onInit?: (context: InitDecoratorContext) => void;
  onRegister?: (context: RegisterDecoratorContext) => void;
  onResolve?: (context: ResolveDecoratorContext) => void;
  onDispose?: (context: DisposeDecoratorContext) => void;
};

const createDecorator = <Callback extends DecoratorCallback>(name: string, callback: Callback) => {
  return (...args: Parameters<Callback>) => {
    return (target: any, propertyKey?: any, descriptor?: any) => {
      const handlers = callback(...args);

      const initDecoratorContext = new InitDecoratorContext();

      initDecoratorContext.name = name;
      initDecoratorContext.target = target;
      initDecoratorContext.propertyKey = propertyKey;
      initDecoratorContext.descriptor = descriptor;

      if ( handlers.on && !handlers.on.includes(initDecoratorContext.type) ) {
        throw new Error(`${initDecoratorContext.displayName} can only be used on ${handlers.on.join(", ")}`);
      }

      if ( handlers.onInit ) {
        handlers.onInit(initDecoratorContext);
      }

      if ( handlers.onRegister ) {
        const registers = onRegisterMetadata.get(target) || [];

        registers.push({
          name,
          callback: (rosection) => {
            const registerDecoratorContext = RegisterDecoratorContext.from(initDecoratorContext);

            registerDecoratorContext.rosection = rosection;

            return handlers.onRegister!(registerDecoratorContext);
          },
        });

        onRegisterMetadata.set(registers, target);
      }

      if ( handlers.onResolve ) {
        const resolves = onResolveMetadata.get(target) || [];

        resolves.push({
          name,
          callback: (rosection, instance) => {
            const resolveDecoratorContext = ResolveDecoratorContext.from(initDecoratorContext);

            resolveDecoratorContext.rosection = rosection;
            resolveDecoratorContext.instance = instance;

            return handlers.onResolve!(resolveDecoratorContext);
          },
        });

        onResolveMetadata.set(resolves, target);
      }

      if ( handlers.onDispose ) {
        const disposes = onDisposeMetadata.get(target) || [];

        disposes.push({
          name,
          callback: (rosection, instance) => {
            const disposeDecoratorContext = DisposeDecoratorContext.from(initDecoratorContext);

            disposeDecoratorContext.rosection = rosection;
            disposeDecoratorContext.instance = instance;

            return handlers.onDispose!(disposeDecoratorContext);
          },
        });

        onDisposeMetadata.set(disposes, target);
      }
    };
  };
};

const Use = createDecorator("use", (token?: IToken<unknown>, optional?: boolean) => {
  if ( token ) {
    if ( !(token instanceof Token) ) {
      token = Token.from(token);
    }
  }

  return {
    on: [
      DecoratorType.Property,
      DecoratorType.StaticProperty,
      DecoratorType.Parameter,
    ],
    onResolve(context) {
      const resolveProperty = () => {
        if ( !token ) {
          const propertyType = metadata.getType(context.target, context.propertyKey);

          if ( !propertyType ) {
            throw new Error(`Could not resolve type for property ${context.propertyKey}`);
          }

          token = Token.from(propertyType);
        }

        const instance = context.rosection.resolve(token);

        if ( context.instance ) {
          Reflect.set(context.instance, context.propertyKey, instance);
        } else {
          Reflect.set(context.target, context.propertyKey, instance);
        }
      };
      const resolveParameter = () => {
        if ( !token ) {
          const parameterTypes = metadata.getParamTypes(context.target, context.propertyKey);

          if ( !parameterTypes ) {
            throw new Error(`Could not resolve type for parameter at index ${context.descriptor}`);
          }

          const parameterType = parameterTypes.at(context.descriptor);

          if ( !parameterType ) {
            throw new Error(`Could not resolve type for parameter at index ${context.descriptor}`);
          }

          token = Token.from(parameterType);
        }

        context.defineParameter(token, optional);
      };

      if ( context.type === DecoratorType.Parameter ) {
        resolveParameter();
      } else {
        resolveProperty();
      }
    },
  };
});

const Usable = createDecorator("usable", (token?: IToken<unknown>) => {
  if ( token ) {
    if ( !(token instanceof Token) ) {
      token = Token.from(token);
    }
  }

  return {
    on: [
      DecoratorType.Class,
    ],
    onInit(context) {
      if ( !token ) {
        token = Token.from(context.target);
      }

      rosection.register(token, useClass({
        constructor: context.target,
      }));
    },
  };
});

interface ICacheableOptions {
  cacheArgs?: boolean;
}

const Cacheable = createDecorator("cacheable", (options?: ICacheableOptions) => {
  return {
    on: [
      DecoratorType.Method,
      DecoratorType.StaticMethod,
    ],
    onInit(context) {
      const originalMethod = context.descriptor.value;

      context.descriptor.value = (...args: any[]) => {
        if ( !(options?.cacheArgs) ) {
          args = [];
        }

        const cacheId = createHash("sha256").update(JSON.stringify(args)).digest("hex");

        if ( metadata.hasMetadata(cacheId, context.target, context.propertyKey) ) {
          return metadata.getMetadata(cacheId, context.target, context.propertyKey);
        }

        const result = originalMethod(...args);

        metadata.setMetadata(cacheId, result, context.target, context.propertyKey);

        return result;
      };
    },
  };
});

interface IDebounceOptions {
  wait?: number;
}

const Debounce = createDecorator("debounce", (options?: IDebounceOptions) => {
  return {
    on: [
      DecoratorType.Method,
      DecoratorType.StaticMethod,
    ],
    onInit(context) {
      const originalMethod = context.descriptor.value;

      let timeout: NodeJS.Timeout;

      context.descriptor.value = (...args: any[]) => {
        if ( timeout ) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          originalMethod(...args);
        }, options?.wait ?? 0);
      };
    },
  };
});

export {
  createDecorator,
};

export {
  Use,
  Usable,
  Cacheable,
  Debounce,
};