enum DecoratorType {
  Class = "Class",
  Property = "Property",
  StaticProperty = "StaticProperty",
  Accessor = "Accessor",
  StaticAccessor = "StaticAccessor",
  Method = "Method",
  StaticMethod = "StaticMethod",
  Parameter = "Parameter",
}

const getDecoratorType = (target: any, key?: any, descriptor?: any) => {
  if ( target && key === undefined && descriptor === undefined ) {
    return DecoratorType.Class;
  }

  if ( descriptor === undefined ) {
    if ( typeof target === "function" ) {
      return DecoratorType.StaticProperty;
    }

    return DecoratorType.Property;
  }

  if ( typeof descriptor === "number" ) {
    return DecoratorType.Parameter;
  }

  if ( descriptor.value ) {
    if ( typeof target === "function" ) {
      return DecoratorType.StaticMethod;
    }

    return DecoratorType.Method;
  }

  if ( descriptor.get || descriptor.set ) {
    if ( typeof target === "function" ) {
      return DecoratorType.StaticAccessor;
    }

    return DecoratorType.Accessor;
  }

  throw new Error("Decorator type not found");
};

export {
  DecoratorType,
  getDecoratorType,
};