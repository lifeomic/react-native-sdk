import {
  analyticsListener,
  createAnalyticsEmitter,
  _sdkTracker,
} from './AnalyticsEvents';

describe('AnalyticsEvents', () => {
  it('allows tracking SDK events', async () => {
    const eventKey = 'Login';
    const event = {
      usedInvite: true,
    };
    const listener = jest.fn();
    analyticsListener.addListener('track', listener);
    _sdkTracker.track(eventKey, event);
    analyticsListener.removeListener('track', listener);
    _sdkTracker.track(eventKey, event);

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
    analyticsListener.addListener('identifyUser', identifyUserListener);
    analyticsListener.addListener(
      'userPropertyUpdate',
      userPropertyUpdateListener,
    );
    analyticsListener.addListener('reset', resetListener);

    const userId = 'analytics-user-id';
    _sdkTracker.identifyUser(userId);
    const userPropertyKey = 'analytics-user-property-key';
    const userPropertyValue = 'analytics-user-property-value';
    _sdkTracker.userPropertyUpdate(userPropertyKey, userPropertyValue);
    _sdkTracker.reset();

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
