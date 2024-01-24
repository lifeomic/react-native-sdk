import { EventEmitter } from 'events';

/**
 * A wrapper around node's events module for convenience.
 * Adds unsubscribe method to the returned result of `addListener`
 */
export class SDKEventEmitter {
  public emitter = new EventEmitter();

  public addListener<
    Type extends string,
    Listener extends (...args: any[]) => void,
  >(eventType: Type, listener: Listener) {
    const subscription = this.emitter.addListener(eventType, listener);
    const unsubscribe = () => {
      this.emitter.removeListener(eventType, listener);
    };

    return {
      ...subscription,
      /**
       * Removes this subscription from the emitter that registered it.
       * Similar to using emitter.removeEventListener(eventName, listener)
       * except it does not return the EventEmitter instance.
       */
      unsubscribe,
      /**  @alias unsubscribe */
      remove: unsubscribe,
    };
  }

  public removeListener<
    Type extends string,
    Listener extends (...args: any[]) => void,
  >(eventType: Type, listener: Listener) {
    return this.emitter.removeListener(eventType, listener);
  }

  public emit<Type extends string>(eventType: Type, ...params: any) {
    return this.emitter.emit(eventType, ...params);
  }
}
