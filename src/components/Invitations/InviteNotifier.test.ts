import { EventTypes, inviteNotifier } from './InviteNotifier';

it('allows simplified EventEmitter functionality', async () => {
  const inviteParams = {
    inviteId: 'invite-id',
    evc: 'evc',
  };
  for (const eventType of [
    'inviteAccepted',
    'inviteDetected',
  ] as EventTypes[]) {
    const listener = jest.fn();
    inviteNotifier.addListener(eventType, listener);
    inviteNotifier.emit(eventType, inviteParams);
    inviteNotifier.removeListener(eventType, listener);
    inviteNotifier.emit(eventType, inviteParams);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(inviteParams);
  }
});

it('caches last emitted invite detected so new listeners can consume invite params', async () => {
  const inviteParams = {
    inviteId: 'invite-id',
    evc: 'evc',
  };
  const listener = jest.fn();
  inviteNotifier.emit('inviteDetected', inviteParams);
  inviteNotifier.addListener('inviteDetected', listener);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(inviteParams);
});

it('allows for clearing cache', async () => {
  const inviteParams = {
    inviteId: 'invite-id',
    evc: 'evc',
  };
  const listener = jest.fn();
  inviteNotifier.emit('inviteDetected', inviteParams);
  inviteNotifier.clearCache();
  inviteNotifier.addListener('inviteDetected', listener);

  expect(listener).not.toHaveBeenCalled();
});
