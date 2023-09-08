import { createMetadata } from "@rosection/utils";
import { Rosection, IToken } from "rosection";

interface OnRegister {
  name: string;
  callback: (rosection: Rosection) => any;
}

const onRegisterMetadata = createMetadata<OnRegister[]>("onRegister");

interface OnResolve {
  name: string;
  callback: (rosection: Rosection, instance: any) => any;
}

const onResolveMetadata = createMetadata<OnResolve[]>("onResolve");

interface OnDispose {
  name: string;
  callback: (rosection: Rosection, instance: any) => any;
}

const onDisposeMetadata = createMetadata<OnDispose[]>("onDispose");

//

interface Parameter {
  optional?: boolean;
  token: IToken<any>;
  index: number;
}

const parameterMetadata = createMetadata<Parameter[]>("parameter");

export {
  onRegisterMetadata,
  onResolveMetadata,
  onDisposeMetadata,
  //
  parameterMetadata,
};