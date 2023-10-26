import { EventEmitter } from 'events';

export type TrackEvents = {
  LOGIN_WITH_INVITE: any;
};

export type EventKeys = keyof TrackEvents;
export type EventValue<T extends EventKeys> = TrackEvents[T];

export type EventTypeHandlers = {
  track: (eventName: EventKeys, event: EventValue<EventKeys>) => void;
  userPropertyUpdate: (
    key: string,
    value: string | number | boolean | undefined,
  ) => void;
  reset: () => void;
};

export type EventTypes = keyof EventTypeHandlers;
export type EventTypeHandler<T extends EventTypes> = EventTypeHandlers[T];
export class InviteNotifier {
  private emitter = new EventEmitter();

  public addListener<T extends EventTypes>(
    eventType: T,
    listener: EventTypeHandler<T>,
  ) {
    return this.emitter.addListener(eventType, listener);
  }

  public removeListener<T extends EventTypes>(
    eventType: EventTypes,
    listener: EventTypeHandler<T>,
  ) {
    return this.emitter.removeListener(eventType, listener);
  }

  public emit<T extends EventTypes>(
    eventType: T,
    ...params: Parameters<EventTypeHandler<T>>
  ) {
    return this.emitter.emit(eventType, ...params);
  }
}

export const inviteNotifier = new InviteNotifier();
