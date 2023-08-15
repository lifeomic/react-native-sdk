import { EventEmitter } from 'events';

/**
 * An event emitter abstraction that supports type-safe event handling.
 *
 * @example
 * type UserEventMap = {
 *   didLogin: { username: string, ... }
 *   didLogout: { username: string, ... }
 *   didUpdate: { username: string, ... }
 * }
 *
 * const userEvents = new TypedEmitter<UserEventMap>();
 *
 * userEvents.addListener('didLogin', (event) => {
 *   event.username;
 * })
 *
 * userEvents.emit('didLogout', { username: 'foo', ... }})
 */
export class TypedEmitter<EventMap extends { [key: string]: any } = never> {
  private readonly emitter: EventEmitter;
  constructor(options?: { captureRejections?: boolean }) {
    this.emitter = new EventEmitter(options);
  }

  addListener<Type extends keyof EventMap & string>(
    type: Type,
    listener: (event: EventMap[Type]) => void,
  ): TypedEmitter<EventMap> {
    this.emitter.addListener(type, listener);
    return this;
  }

  removeListener<Type extends keyof EventMap & string>(
    type: Type,
    listener: (event: EventMap[Type]) => void,
  ): TypedEmitter<EventMap> {
    this.emitter.removeListener(type, listener);
    return this;
  }

  once<Type extends keyof EventMap & string>(
    type: Type,
    listener: (event: EventMap[Type]) => void,
  ): TypedEmitter<EventMap> {
    this.emitter.once(type, listener);
    return this;
  }

  emit<Type extends keyof EventMap & string>(
    type: Type,
    event: EventMap[Type],
  ): boolean {
    return this.emitter.emit(type, event);
  }
}
