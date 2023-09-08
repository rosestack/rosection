import rosection, { Rosection } from "rosection";

import { parameterMetadata } from "~/utils/metadata";

type InvokeArg = {
  index: number;
};

interface InvokeValueArg extends InvokeArg {
  value: any;
}

interface InvokeTokenArg extends InvokeArg {
  token: any;
}

interface InvokeOptions {
  rosection?: Rosection;
  args?: (InvokeValueArg | InvokeTokenArg)[];
}

const invoke = <Instance extends object>(instance: Instance, method: keyof Instance, options?: InvokeOptions) => {
  const resolvedOptions: Required<InvokeOptions> = {
    rosection: rosection,
    args: [],
    ...options,
  };

  if ( !Reflect.has(instance, method) ) {
    throw new Error(`Method ${method.toString()} does not exist on instance`);
  }

  const args: any[] = [];

  parameterMetadata.get(instance, method)?.forEach((parameter) => {
    args[parameter.index] = resolvedOptions.rosection.resolve(parameter.token);
  });

  for ( const arg of resolvedOptions.args ) {
    if ( "value" in arg ) {
      args[arg.index] = arg.value;
    } else {
      args[arg.index] = resolvedOptions.rosection.resolve(arg.token);
    }
  }

  return instance[method](...args);
};

export {
  invoke,
};