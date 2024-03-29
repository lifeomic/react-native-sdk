import { EventEmitter } from 'events';
import { ConsentAndForm } from '../../hooks/useConsent';

export type AnalyticsEventTypeHandlers = {
  track: (eventName: string, event: unknown) => void;
  setUser: (id: string) => void;
  updateUserProperty: (
    key: string,
    value: string | number | boolean | undefined,
  ) => void;
  resetUser: () => void;
};

export type AnalyticsEventTypes = keyof AnalyticsEventTypeHandlers;
export type AnalyticsEventTypeHandler<T extends AnalyticsEventTypes> =
  AnalyticsEventTypeHandlers[T];

const emitter = new EventEmitter();

export type Tracker<CustomEventMap extends Record<string, unknown>> = {
  track<Key extends keyof CustomEventMap>(
    name: Key,
    event: CustomEventMap[Key],
  ): void;
  setUser: AnalyticsEventTypeHandlers['setUser'];
  updateUserProperty: AnalyticsEventTypeHandlers['updateUserProperty'];
  resetUser: AnalyticsEventTypeHandlers['resetUser'];
};

/**
 * Create a type safe way to emit analytics events. Can do the following actions:
 *
 * track: Tracks an event with a given name and payload with values relevant to that event.
 * setUser: Allows you to start tracking a logged in user's session by their ID.
 * updateUserProperty: Set a value for the current logged in user.
 * resetUser: Reset the current user tracking session, for when the user logs out.
 */
export const createAnalyticsEmitter = <
  EventMap extends Record<string, unknown>,
>(): Tracker<EventMap> => {
  return {
    track: (name, payload) => emitter.emit('track', name as string, payload),
    setUser: (id) => emitter.emit('setUser', id),
    updateUserProperty: (key, value) =>
      emitter.emit('updateUserProperty', key as string, value),
    resetUser: () => emitter.emit('resetUser'),
  };
};

export type SDKTrackEvents = {
  ConsentResponseSubmitted: {
    consentName?: string;
    consentId?: string;
    userAcceptedConsent: boolean;
  };
  ConsentScreenShown: { consentName?: string; consentId?: string };
  ConsentSubmitFailure: {
    reason: string;
    consent?: ConsentAndForm;
    userAcceptedConsent: boolean;
  };
  CustomConsentScreenShown: { consentName?: string; consentId?: string };
  InviteAcceptFailure: { reason: string };
  InviteAcceptSuccess: { accountName: string; accountId: string };
  InviteDetected: {};
  InviteRequiredScreenPresented: {};
  Login: { usedInvite: boolean };
  LoginButtonPresented: { buttonText: string };
  LoginFailure: { error: string; usedInvite: boolean };
  Navigate: {
    fromScreen: string;
    toScreen?: string;
    method: 'pop' | 'replace';
  };
  PostCreated: { messageLength: number };
  PostEdited: { messageLength: number };
  TokenRefreshFailure: { accessTokenExpirationDate: string };
};

/**
 * Class for internal SDK event creation only. You will want to create your own
 * `createAnalyticsEmitter`
 */
export const _sdkAnalyticsEvent = createAnalyticsEmitter<SDKTrackEvents>();

type AnalyticsListener = {
  addListener<EventType extends AnalyticsEventTypes>(
    eventType: EventType,
    listener: AnalyticsEventTypeHandler<EventType>,
  ): void;

  removeListener<EventType extends AnalyticsEventTypes>(
    eventType: EventType,
    listener: AnalyticsEventTypeHandler<EventType>,
  ): void;
};

/**
 * Clients can add/remove listeners with these functions. There is not as much
 * type safety here but it will mostly be used to just pass along to an analytics SDK.
 */
export const analyticsListener: AnalyticsListener = {
  addListener: (...args) => emitter.addListener(...args),
  removeListener: (...args) => emitter.removeListener(...args),
};
