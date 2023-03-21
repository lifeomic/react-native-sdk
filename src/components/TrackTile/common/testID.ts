// See https://dev.to/nextlevelbeard/an-end-to-the-abuse-of-accessibility-ids-5d2j

import { Platform } from 'react-native';

let getBundleId = () => '';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ({ getBundleId } = require('react-native-device-info'));
} catch {
  console.info(
    "Unable to get bundleId. Falling back to default bundleId ''. This is expected if you are running through Expo"
  );
}

const appIdentifier = getBundleId();

export const tID = (testID?: string) => {
  if (!testID) {
    return undefined;
  }

  const prefix = `${appIdentifier}:id/`;
  const hasPrefix = testID.startsWith(prefix);

  return Platform.select({
    android: !hasPrefix ? `${prefix}${testID}` : testID,
    ios: hasPrefix ? testID.slice(prefix.length) : testID
  });
};
