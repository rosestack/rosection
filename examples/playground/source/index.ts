import "reflect-metadata";

type DecoratorCallback = (...args: any[]) => {
  onInit?: (target: any, propertyKey: any, descriptor?: any) => void;
  onResolve?: (instance: any, target: any, propertyKey: any, descriptor?: any) => void;
};

const createDecorator = <Callback extends DecoratorCallback>(name: string, callback: Callback) => {
  return (...args: Parameters<Callback>) => {
    return (target: any, propertyKey: any, descriptor?: any) => {
      const handlers = callback(...args);

      if ( handlers.onInit ) {
        handlers.onInit(target, propertyKey, descriptor);
      }

      if ( handlers.onResolve ) {
        const resolve = Reflect.getMetadata("resolve", target) || [];

        resolve.push({
          name,
          callback: (instance: unknown) => {
            handlers.onResolve!(instance, target, propertyKey, descriptor);
          },
        });

        Reflect.defineMetadata("resolve", resolve, target);
      }
    };
  };
};

const decorator = createDecorator("property", (token: string) => ({
  onInit: (target: any, propertyKey: any, descriptor?: any) => {
    console.log("property", target, propertyKey, descriptor);
  },
  onResolve: (instance: any, target: any, propertyKey: any, descriptor?: any) => {
    console.log("property", instance, target, propertyKey, descriptor);
  },
}));

class Controller {
  @decorator("mode")
  property: string;

  @decorator("mode")
  static staticProperty: string;

  constructor(@decorator("mode") ss: string) {
  }

  @decorator("mode")
  method() {
  }

  @decorator("mode")
  static staticMethod() {
  }

  @decorator("mode")
  get accessor() {
    return "";
  }

  @decorator("mode")
  static get staticAccessor() {
    return "";
  }
}

const resolve = (target: any) => {
  const resolve1 = Reflect.getMetadata("resolve", target) || [];

  for ( const { name, callback } of resolve1 ) {
    console.log("resolve1", name, callback);
    callback();
  }

  const instance = new target();

  const resolve2 = Reflect.getMetadata("resolve", target) || [];

  for ( const { name, callback } of resolve2 ) {
    console.log("resolve2", name, callback);
    callback(instance);
  }

  return instance;
};

resolve(Controller);