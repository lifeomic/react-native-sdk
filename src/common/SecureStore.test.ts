import { SecureStore, unusedUsername } from './SecureStore';

import Keychain from 'react-native-keychain';

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK' },
  SECURITY_LEVEL: { SECURE_SOFTWARE: 'SECURE_SOFTWARE' },
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

type TestObject = { item: string };
const keychainMock = Keychain as jest.Mocked<typeof Keychain>;

describe('SecureStore', () => {
  describe('#constructor', () => {
    it('generates a valid set of keychainOptions', () => {
      const store = new SecureStore<TestObject>('instanceID');
      expect(store.keychainOptions).toMatchObject({
        accessible: 'AFTER_FIRST_UNLOCK',
        securityLevel: 'SECURE_SOFTWARE',
        service: 'com.lifeomic.securestore/instanceID',
      });
    });
    it('generates a valid set of keychainOptions with access group when provided', () => {
      const store = new SecureStore<TestObject>('instanceID', 'accessGroup');
      expect(store.keychainOptions).toMatchObject({
        accessGroup: 'accessGroup',
        accessible: 'AFTER_FIRST_UNLOCK',
        securityLevel: 'SECURE_SOFTWARE',
        service: 'com.lifeomic.securestore/instanceID',
      });
    });
  });

  describe('data access', () => {
    let store: SecureStore<TestObject>;
    const expectedOptions = {
      accessible: 'AFTER_FIRST_UNLOCK',
      securityLevel: 'SECURE_SOFTWARE',
      service: 'com.lifeomic.securestore/instanceID',
    };

    beforeEach(() => {
      store = new SecureStore<TestObject>('instanceID');
    });

    it('sets a generic password with the expected options', async () => {
      await store.setObject({ item: 'item-1' });
      expect(keychainMock.setGenericPassword).toHaveBeenCalledWith(
        unusedUsername,
        '{"item":"item-1"}',
        expectedOptions,
      );
    });

    it('returns a generic password with the username and password when exists', async () => {
      keychainMock.getGenericPassword.mockResolvedValueOnce({
        service: '',
        username: 'unused',
        password: '{"item":"item-1"}',
        storage: '',
      });

      const result = await store.getObject();
      expect(keychainMock.getGenericPassword).toHaveBeenCalledWith(
        expectedOptions,
      );
      expect(result).toMatchObject({
        item: 'item-1',
      });
    });

    it('can clear the specific item', async () => {
      await store.clear();
      expect(keychainMock.resetGenericPassword).toHaveBeenCalledWith(
        expectedOptions,
      );
    });
  });
});
