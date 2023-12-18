import crypto from "crypto";

import { Provider } from "~/provider";

import { Token } from "~/token";

enum ExtensionType {
  BeforeRegister,
  AfterRegister,
  //
  BeforeResolve,
  AfterResolve,
  //
  BeforeDispose,
  AfterDispose,
}

interface Callback {
  id: string;
  type: ExtensionType;
  callback: unknown;
}

type BeforeRegister<Value> = (token: Token<Value>, provider: Provider<Value>) => void;
type AfterRegister<Value> = (token: Token<Value>, provider: Provider<Value>) => void;

//

type BeforeResolve<Value> = (token: Token<Value>) => void;
type AfterResolve<Value> = (token: Token<Value>, value: Value) => void;

//

type BeforeDispose<Value> = (token: Token<Value>, provider: Provider<Value>) => void;
type AfterDispose<Value> = (token: Token<Value>, provider: Provider<Value>) => void;

class Extension {
  private callbacks: Callback[] = [];

  private addCallback(callback: unknown, type: ExtensionType) {
    const id = crypto.randomUUID();

    this.callbacks.push({
      id,
      callback,
      type,
    });

    return () => {
      return this.removeCallback(id);
    };
  }

  private removeCallback(id: string) {
    const index = this.callbacks.findIndex((callback) => {
      return callback.id === id;
    });

    if ( index === -1 ) {
      return;
    }

    this.callbacks.splice(index, 1);
  }

  //

  beforeRegister<Value>(callback: BeforeRegister<Value>) {
    return this.addCallback(callback, ExtensionType.BeforeRegister);
  }

  emitBeforeRegister<Value>(token: Token<Value>, provider: Provider<Value>) {
    const beforeRegisterCallbacks = this.callbacks.filter((callback) => {
      return callback.type === ExtensionType.BeforeRegister;
    });

    for ( const callback of beforeRegisterCallbacks ) {
      (callback.callback as BeforeRegister<Value>)(token, provider);
    }
  }

  afterRegister<Value>(callback: AfterRegister<Value>) {
    return this.addCallback(callback, ExtensionType.AfterRegister);
  }

  emitAfterRegister<Value>(token: Token<Value>, provider: Provider<Value>) {
    const afterRegisterCallbacks = this.callbacks.filter((callback) => {
      return callback.type === ExtensionType.AfterRegister;
    });

    for ( const callback of afterRegisterCallbacks ) {
      (callback.callback as AfterRegister<Value>)(token, provider);
    }
  }

  //

  beforeResolve<Value>(callback: BeforeResolve<Value>) {
    return this.addCallback(callback, ExtensionType.BeforeResolve);
  }

  emitBeforeResolve<Value>(token: Token<Value>) {
    const beforeResolveCallbacks = this.callbacks.filter((callback) => {
      return callback.type === ExtensionType.BeforeResolve;
    });

    for ( const callback of beforeResolveCallbacks ) {
      (callback.callback as BeforeResolve<Value>)(token);
    }
  }

  afterResolve<Value>(callback: AfterResolve<Value>) {
    return this.addCallback(callback, ExtensionType.AfterResolve);
  }

  emitAfterResolve<Value>(token: Token<Value>, value: Value) {
    const afterResolveCallbacks = this.callbacks.filter((callback) => {
      return callback.type === ExtensionType.AfterResolve;
    });

    for ( const callback of afterResolveCallbacks ) {
      (callback.callback as AfterResolve<Value>)(token, value);
    }
  }

  //

  beforeDispose<Value>(callback: BeforeDispose<Value>) {
    return this.addCallback(callback, ExtensionType.BeforeDispose);
  }

  emitBeforeDispose<Value>(token: Token<Value>, provider: Provider<Value>) {
    const beforeDisposeCallbacks = this.callbacks.filter((callback) => {
      return callback.type === ExtensionType.BeforeDispose;
    });

    for ( const callback of beforeDisposeCallbacks ) {
      (callback.callback as BeforeDispose<Value>)(token, provider);
    }
  }

  afterDispose<Value>(callback: AfterDispose<Value>) {
    return this.addCallback(callback, ExtensionType.AfterDispose);
  }

  emitAfterDispose<Value>(token: Token<Value>, provider: Provider<Value>) {
    const afterDisposeCallbacks = this.callbacks.filter((callback) => {
      return callback.type === ExtensionType.AfterDispose;
    });

    for ( const callback of afterDisposeCallbacks ) {
      (callback.callback as AfterDispose<Value>)(token, provider);
    }
  }
}

class ExtensionManager {
  private extensions: Extension[] = [];

  protected beforeRegister<Value>(token: Token<Value>, provider: Provider<Value>) {
    for ( const extension of this.extensions ) {
      extension.emitBeforeRegister(token, provider);
    }
  }

  protected afterRegister<Value>(token: Token<Value>, provider: Provider<Value>) {
    for ( const extension of this.extensions ) {
      extension.emitAfterRegister(token, provider);
    }
  }

  //

  protected beforeResolve<Value>(token: Token<Value>) {
    for ( const extension of this.extensions ) {
      extension.emitBeforeResolve(token);
    }
  }

  protected afterResolve<Value>(token: Token<Value>, value: Value) {
    for ( const extension of this.extensions ) {
      extension.emitAfterResolve(token, value);
    }
  }

  //

  protected beforeDispose<Value>(token: Token<Value>, provider: Provider<Value>) {
    for ( const extension of this.extensions ) {
      extension.emitBeforeDispose(token, provider);
    }
  }

  protected afterDispose<Value>(token: Token<Value>, provider: Provider<Value>) {
    for ( const extension of this.extensions ) {
      extension.emitAfterDispose(token, provider);
    }
  }

  addExtension(extension: Extension) {
    this.extensions.push(extension);

    return () => {
      return this.removeExtension(extension);
    };
  }

  removeExtension(extension: Extension) {
    this.extensions.splice(this.extensions.indexOf(extension), 1);

    return () => {
      return this.addExtension(extension);
    };
  }
}

export type {
  BeforeRegister,
  AfterRegister,
  //
  BeforeResolve,
  AfterResolve,
  //
  BeforeDispose,
  AfterDispose,
};

export {
  Extension,
};

export default ExtensionManager;