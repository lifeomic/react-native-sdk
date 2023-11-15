import { EventEmitter } from 'events';

export type AnalyticsEventTypeHandlers = {
  track: (eventName: string, event: unknown) => void;
  identifyUser: (id: string) => void;
  userPropertyUpdate: (
    key: string,
    value: string | number | boolean | undefined,
  ) => void;
  reset: () => void;
};

export type AnalyticsEventTypes = keyof AnalyticsEventTypeHandlers;
export type AnalyticsEventTypeHandler<T extends AnalyticsEventTypes> =
  AnalyticsEventTypeHandlers[T];

class AnalyticsEvents {
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

const analyticsEvents = new AnalyticsEvents();

export type Tracker<CustomEventMap extends Record<string, unknown>> = {
  track<Key extends keyof CustomEventMap>(
    name: Key,
    event: CustomEventMap[Key],
  ): void;
  identifyUser: AnalyticsEventTypeHandlers['identifyUser'];
  userPropertyUpdate: AnalyticsEventTypeHandlers['userPropertyUpdate'];
  reset: AnalyticsEventTypeHandlers['reset'];
};

/**
 * Create a type safe way to emit analytics events. Can do the following actions:
 *
 * track: Tracks an event with a given name and payload with values relevant to that event.
 * identifyUser: Allows you to start tracking a logged in users session by their ID.
 * userPropertyUpdate: Set a value for the current logged in user.
 * reset: Reset the current user tracking session, for when the user logs out.
 */
export const createAnalyticsEmitter = <
  EventMap extends Record<string, unknown>,
>(): Tracker<EventMap> => {
  return {
    track: (name, payload) =>
      analyticsEvents.emit('track', name as string, payload),
    identifyUser: (id) => analyticsEvents.emit('identifyUser', id),
    userPropertyUpdate: (key, value) =>
      analyticsEvents.emit('userPropertyUpdate', key as string, value),
    reset: () => analyticsEvents.emit('reset'),
  };
};

export type SDKTrackEvents = {
  Login: { usedInvite: boolean };
  PostCreated: { messageLength: number };
  PostEdited: { messageLength: number };
};

// class for internal tracking use only
export const _sdkTracker = createAnalyticsEmitter<SDKTrackEvents>();

/**
 * Clients can add/remove listeners with these functions. There is not as much
 * type safety here but it will mostly be used to just pass along to an analytics SDK.
 */
export const analyticsListener = {
  addListener: analyticsEvents.addListener.bind(analyticsEvents),
  removeListener: analyticsEvents.removeListener.bind(analyticsEvents),
};
