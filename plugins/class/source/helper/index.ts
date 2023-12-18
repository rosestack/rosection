import { Rosection } from "rosection";

import { parameterMetadata } from "~/utils/metadata";

const invoke = <Instance extends Object>(instance: Instance, method: keyof Instance) => {
  if ( !Reflect.has(instance, method) ) {
    throw new Error(`Method ${method.toString()} does not exist on instance`);
  }

  const rosection = instance.constructor?.prototype?.rosection as Rosection;

  if ( !rosection ) {
    throw new Error("Instance is not registered with rosection");
  }

  const args: any[] = [];

  parameterMetadata.get(instance, method)?.forEach((parameter) => {
    const { index, token, optional } = parameter;

    if ( optional ) {
      args[index] = rosection.resolveOr(token, undefined);
    } else {
      args[index] = rosection.resolve(token);
    }
  });

  return (instance as any)[method](...args);
};

export {
  invoke,
};
