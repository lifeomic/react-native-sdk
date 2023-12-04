import { inviteNotifier } from './InviteNotifier';

it('allows simplified EventEmitter functionality', async () => {
  const inviteParams = {
    inviteId: 'invite-id',
    evc: 'evc',
  };
  const listener = jest.fn();
  inviteNotifier.addListener('inviteDetected', listener);
  inviteNotifier.emit('inviteDetected', inviteParams);
  inviteNotifier.removeListener('inviteDetected', listener);
  inviteNotifier.emit('inviteDetected', inviteParams);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(inviteParams);
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
