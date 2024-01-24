import {
  analyticsListener,
  createAnalyticsEmitter,
  _sdkAnalyticsEvent,
} from './AnalyticsEvents';

describe('AnalyticsEvents', () => {
  it('allows tracking SDK events', async () => {
    const eventKey = 'Login';
    const event = {
      usedInvite: true,
    };
    const listener = jest.fn();
    const { remove } = analyticsListener.addListener('track', listener);
    _sdkAnalyticsEvent.track(eventKey, event);
    remove();
    _sdkAnalyticsEvent.track(eventKey, event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(eventKey, event);
  });

  it('allows users to track custom events', async () => {
    type MyTrackEvents = {
      EventOne: {
        requiredValue: string;
      };
    };
    const eventKey = 'EventOne';
    const event = {
      requiredValue: 'my value',
    };
    const listener = jest.fn();
    analyticsListener.addListener('track', listener);
    const tracker = createAnalyticsEmitter<MyTrackEvents>();
    tracker.track(eventKey, event);
    analyticsListener.removeListener('track', listener);
    tracker.track(eventKey, event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(eventKey, event);
  });

  it('allows identifying a user, adding a value for the user, and then resetting the session', () => {
    const identifyUserListener = jest.fn();
    const userPropertyUpdateListener = jest.fn();
    const resetListener = jest.fn();
    analyticsListener.addListener('setUser', identifyUserListener);
    analyticsListener.addListener(
      'updateUserProperty',
      userPropertyUpdateListener,
    );
    analyticsListener.addListener('resetUser', resetListener);

    const userId = 'analytics-user-id';
    _sdkAnalyticsEvent.setUser(userId);
    const userPropertyKey = 'analytics-user-property-key';
    const userPropertyValue = 'analytics-user-property-value';
    _sdkAnalyticsEvent.updateUserProperty(userPropertyKey, userPropertyValue);
    _sdkAnalyticsEvent.resetUser();

    expect(identifyUserListener).toHaveBeenCalledTimes(1);
    expect(identifyUserListener).toHaveBeenCalledWith(userId);
    expect(userPropertyUpdateListener).toHaveBeenCalledTimes(1);
    expect(userPropertyUpdateListener).toHaveBeenCalledWith(
      userPropertyKey,
      userPropertyValue,
    );
    expect(resetListener).toHaveBeenCalledTimes(1);
    expect(resetListener).toHaveBeenCalledWith();
  });
});
