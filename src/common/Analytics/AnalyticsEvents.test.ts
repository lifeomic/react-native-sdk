import { inviteNotifier } from './AnalyticsEvents';

describe('AnalyticsEvents', () => {
  it('allows track events', async () => {
    const event = {
      user: 'abc123',
    };
    const listener = jest.fn();
    inviteNotifier.addListener('track', listener);
    inviteNotifier.emit('track', 'LOGIN_WITH_INVITE', event);
    inviteNotifier.removeListener('track', listener);
    inviteNotifier.emit('track', 'LOGIN_WITH_INVITE', event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('LOGIN_WITH_INVITE', event);
  });
});
