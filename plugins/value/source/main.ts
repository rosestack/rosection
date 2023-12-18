import {Provider, Token} from "rosection";

type ValueType<Value> = Value extends ValueProvider<infer Type> ? Type : never;

interface IValueProvider<Value> {
  onRegister?: () => void;
  onDispose?: () => void;
}

abstract class ValueProvider<Value> extends Provider<Value> {
  protected provider: IValueProvider<Value>;

  register() {
    if (this.provider.onRegister) {
      this.provider.onRegister();
    }
  }

  dispose() {
    if (this.provider.onDispose) {
      this.provider.onDispose();
    }
  }
}

interface IStaticValue<Value> extends IValueProvider<Value> {
  value: Value;
}

class StaticValueProvider<Value> extends ValueProvider<Value> {

  constructor(override provider: IStaticValue<Value>) {
    super();
  }

  get token() {
    return Token.from(this.provider.value as any);
  }

  override resolve() {
    return this.provider.value;
  }
}

interface IDynamicValue<Value> extends IValueProvider<Value> {
  value: () => Value;
}

class DynamicValueProvider<Value> extends ValueProvider<Value> {
  constructor(override provider: IDynamicValue<Value>) {
    super();
  }

  get token() {
    return Token.from(this.provider.value as any);
  }

  override resolve() {
    return this.provider.value();
  }
}

const useStaticValue = <Value>(provider: IStaticValue<Value>) => {
  return new StaticValueProvider(provider);
};

const useDynamicValue = <Value>(provider: IDynamicValue<Value>) => {
  return new DynamicValueProvider(provider);
};

export type {
  ValueType,
};

export {
  useStaticValue,
  useDynamicValue,
};