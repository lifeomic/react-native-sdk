import { analyticsEvents } from './AnalyticsEvents';

describe('AnalyticsEvents', () => {
  it('allows track events', async () => {
    const event = {
      user: 'abc123',
    };
    const listener = jest.fn();
    analyticsEvents.addListener('track', listener);
    analyticsEvents.emit('track', 'LoginWithInvite', event);
    analyticsEvents.removeListener('track', listener);
    analyticsEvents.emit('track', 'LoginWithInvite', event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('LOGIN_WITH_INVITE', event);
  });
});
