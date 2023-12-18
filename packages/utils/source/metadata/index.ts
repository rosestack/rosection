import "reflect-metadata";

enum DesignMetadata {
  TYPE = "design:type",
  PARAMTYPES = "design:paramtypes",
  RETURNTYPE = "design:returntype",
}

const metadata = {
  get(target: any, propertyKey?: any, receiver?: unknown) {
    return Reflect.get(target, propertyKey, receiver);
  },
  set(target: any, propertyKey: string, value: any, receiver?: any) {
    return Reflect.set(target, propertyKey, value, receiver);
  },
  has(target: any, propertyKey: string) {
    return Reflect.has(target, propertyKey);
  },
  //
  hasMetadata(key: string, target: any, propertyKey?: any): boolean {
    return Reflect.hasMetadata(key, target, propertyKey);
  },
  getMetadata<T>(key: string, target: any, propertyKey?: any): (T | undefined) {
    return Reflect.getMetadata(key, target, propertyKey);
  },
  setMetadata<T>(key: string, value: T, target: any, propertyKey?: any) {
    return Reflect.defineMetadata(key, value, target, propertyKey);
  },
  //
  getType(target: any, propertyKey?: any): (any | undefined) {
    return metadata.getMetadata(DesignMetadata.TYPE, target, propertyKey);
  },
  setType(value: any, target: any, propertyKey?: any) {
    return metadata.setMetadata(DesignMetadata.TYPE, value, target, propertyKey);
  },
  //
  getParamTypes(target: any, propertyKey?: any): (any[] | undefined) {
    return metadata.getMetadata(DesignMetadata.PARAMTYPES, target, propertyKey);
  },
  setParamTypes(value: any[], target: any, propertyKey?: any) {
    return metadata.setMetadata(DesignMetadata.PARAMTYPES, value, target, propertyKey);
  },
  //
  getReturnType(target: any, propertyKey?: any): (any | undefined) {
    return metadata.getMetadata(DesignMetadata.RETURNTYPE, target, propertyKey);
  },
  setReturnType(value: any, target: any, propertyKey?: any) {
    return metadata.setMetadata(DesignMetadata.RETURNTYPE, value, target, propertyKey);
  },
};

const createMetadata = <T>(key: string) => {
  return {
    get(target: any, propertyKey?: any) {
      return metadata.getMetadata<T>(key, target, propertyKey);
    },
    set(value: T, target: any, propertyKey?: string) {
      return metadata.setMetadata<T>(key, value, target, propertyKey);
    },
  };
};

export {
  metadata,
  createMetadata,
};