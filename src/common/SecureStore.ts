import Keychain from 'react-native-keychain';

/**
 * This is a wrapper to simplify our use of the keychain / other storage (Android) -
 * See: https://github.com/oblador/react-native-keychain for more documentation
 *
 *
 * Notes: Using "generic" credentials to keep things flexible -- the "service" is what differentiates each client (or other item)
 */

/**
 * A container for data that should be encrypted at rest on the user's device.
 *
 * Should not contain large amounts of data as serialization/deserialization can be slow.
 *
 * @param instanceIdentifier a unique identifier for the context, could be a client or user id, etc.
 */
export class SecureStore<Stored> {
  instanceIdentifier: string;
  keychainOptions: Keychain.Options;

  constructor(instanceIdentifier: string, accessGroup?: string) {
    this.instanceIdentifier = instanceIdentifier;

    this.keychainOptions = {
      ...(accessGroup ? { accessGroup } : undefined),
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
      service: `com.lifeomic.securestore/${instanceIdentifier}`,
      // This will require that the Android Keystore is used.
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
    };
  }

  /**
   * Stores an object as { username, password } at key com.lifeomic.securestore/<instanceIdentifier>
   * @param object
   */
  async setObject(itemId: string, object: Stored) {
    return Keychain.setGenericPassword(
      itemId,
      JSON.stringify(object),
      this.keychainOptions,
    );
  }

  async getObject() {
    const result = await Keychain.getGenericPassword(this.keychainOptions);

    if (result === false) {
      return null;
    } else {
      const { username, password } = result;
      const secureData: Stored = JSON.parse(password);
      return { username, ...secureData };
    }
  }

  async clear() {
    return Keychain.resetGenericPassword(this.keychainOptions);
  }
}
