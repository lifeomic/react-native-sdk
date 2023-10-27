import { EventEmitter } from 'events';

export type AnalyticsEventTypeHandlers = {
  track: (eventName: string, event: unknown) => void;
  userPropertyUpdate: (
    key: string,
    value: string | number | boolean | undefined,
  ) => void;
  reset: () => void;
};

export type AnalyticsEventTypes = keyof AnalyticsEventTypeHandlers;
export type AnalyticsEventTypeHandler<T extends AnalyticsEventTypes> =
  AnalyticsEventTypeHandlers[T];

export class AnalyticsEvents {
  private emitter = new EventEmitter();

  public addListener<EventType extends AnalyticsEventTypes>(
    eventType: EventType,
    listener: AnalyticsEventTypeHandler<EventType>,
  ) {
    return this.emitter.addListener(eventType, listener);
  }

  public removeListener<EventType extends AnalyticsEventTypes>(
    eventType: EventType,
    listener: AnalyticsEventTypeHandler<EventType>,
  ) {
    return this.emitter.removeListener(eventType, listener);
  }

  public emit<EventType extends AnalyticsEventTypes>(
    eventType: EventType,
    ...params: Parameters<AnalyticsEventTypeHandler<EventType>>
  ) {
    return this.emitter.emit(eventType, ...params);
  }
}

export const analyticsEvents = new AnalyticsEvents();

export type Tracker<CustomEventMap extends Record<string, unknown>> = {
  track<Key extends keyof CustomEventMap>(
    name: Key,
    event: CustomEventMap[Key],
  ): void;
  userPropertyUpdate: AnalyticsEventTypeHandlers['userPropertyUpdate'];
  reset: AnalyticsEventTypeHandlers['reset'];
};

// Wrapper around analyticsEvents to allow users to set types
export const createAnalyticsEmitter = <
  EventMap extends Record<string, unknown>,
>(): Tracker<EventMap> => {
  return {
    track: (name, payload) =>
      analyticsEvents.emit('track', name as string, payload),
    userPropertyUpdate: (key, value) =>
      analyticsEvents.emit('userPropertyUpdate', key as string, value),
    reset: () => analyticsEvents.emit('reset'),
  };
};

export type SDKTrackEvents = {
  LoginWithInvite: Record<string, any>;
};

// class for internal tracking use only
export const sdkTracker = createAnalyticsEmitter<SDKTrackEvents>();
