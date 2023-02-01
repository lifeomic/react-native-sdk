// See https://dev.to/nextlevelbeard/an-end-to-the-abuse-of-accessibility-ids-5d2j

import { Platform } from 'react-native';
import { getBundleId } from 'react-native-device-info';

const appIdentifier = getBundleId();

export function getTestID(testId: string) {
  if (!testId) {
    return undefined;
  }

  const prefix = `${appIdentifier}:id/`;
  const hasPrefix = testId.startsWith(prefix);

  return Platform.select({
    android: !hasPrefix ? `${prefix}${testId}` : testId,
    ios: hasPrefix ? testId.slice(prefix.length) : testId,
  });
}

export const tID = getTestID;
