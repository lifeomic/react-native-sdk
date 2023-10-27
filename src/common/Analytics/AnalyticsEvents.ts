import { EventEmitter } from 'events';

export type TrackEvents = {
  LoginWithInvite: Record<string, any>;
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
export class AnalyticsEvents {
  private emitter = new EventEmitter();

  public addListener<ET extends EventTypes>(
    eventType: ET,
    listener: EventTypeHandler<ET>,
  ) {
    return this.emitter.addListener(eventType, listener);
  }

  public removeListener<ET extends EventTypes>(
    eventType: EventTypes,
    listener: EventTypeHandler<ET>,
  ) {
    return this.emitter.removeListener(eventType, listener);
  }

  public emit<ET extends EventTypes>(
    eventType: ET,
    ...params: Parameters<EventTypeHandler<ET>>
  ) {
    return this.emitter.emit(eventType, ...params);
  }
}

export const analyticsEvents = new AnalyticsEvents();
