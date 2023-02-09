import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from 'i18next';
import DeviceInfo from 'react-native-device-info';

import { OAuthLogoutButton } from '../components/OAuthLogoutButton';
import { tID } from '../common/testID';

const versionNumber = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const fullVersion = versionNumber + ' (' + buildNumber + ')';

export const SettingsScreen = () => {
  return (
    <View style={styles.subMenuContainer}>
      <OAuthLogoutButton>
        <Text>{t('settings-logout', 'Logout')}</Text>
      </OAuthLogoutButton>
      <View style={styles.versionContainer}>
        <Text testID={tID('version-text')}>
          {t('settings-version', 'Version {{ version }}', {
            version: fullVersion,
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subMenuContainer: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  container: {
    flex: 1,
  },
  versionContainer: {
    paddingVertical: 14,
    marginTop: 28,
  },
});

export default SettingsScreen;
