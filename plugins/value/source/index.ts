import { Provider, Token } from "rosection";

interface ISharedValue<Value> {
  onRegister?: () => void;
  onDispose?: () => void;
}

abstract class SharedValue<Value> extends Provider<Value> {
  protected provider: ISharedValue<Value>;

  register() {
    if ( this.provider.onRegister ) {
      this.provider.onRegister();
    }
  }

  dispose() {
    if ( this.provider.onDispose ) {
      this.provider.onDispose();
    }
  }
}

interface IStaticValue<Value> extends ISharedValue<Value> {
  value: Value;
}

class StaticValueProvider<Value> extends SharedValue<Value> {

  constructor(override provider: IStaticValue<Value>) {
    super();
  }

  get token() {
    return Token.from(this.provider.value as any);
  }

  resolve() {
    return this.provider.value;
  }
}

interface IDynamicValue<Value> extends ISharedValue<Value> {
  value: () => Value;
}

class DynamicValueProvider<Value> extends SharedValue<Value> {
  constructor(override provider: IDynamicValue<Value>) {
    super();
  }

  get token() {
    return Token.from(this.provider.value as any);
  }

  resolve() {
    return this.provider.value();
  }
}

const useStaticValue = <Value>(provider: IStaticValue<Value>) => {
  return new StaticValueProvider(provider);
};

const useDynamicValue = <Value>(provider: IDynamicValue<Value>) => {
  return new DynamicValueProvider(provider);
};

export {
  useStaticValue,
  useDynamicValue,
};