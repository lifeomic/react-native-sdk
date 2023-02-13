import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { t } from 'i18next';
import DeviceInfo from 'react-native-device-info';

import { OAuthLogoutButton } from '../components/OAuthLogoutButton';
import { tID } from '../common/testID';
import { useActiveAccount } from '../hooks/useActiveAccount';

const versionNumber = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const fullVersion = versionNumber + ' (' + buildNumber + ')';

const MainMenuItem = ({
  title,
  action,
  badge,
}: {
  title: string;
  action?: () => void;
  badge?: React.ReactNode;
}) => {
  return (
    <TouchableOpacity onPress={action} accessibilityRole="button">
      <View style={styles.mainMenuItem}>
        <Text>{title}</Text>
        {badge}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const { account } = useActiveAccount();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {account?.name && <MainMenuItem title={account?.name} />}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainMenuItem: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
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
  scroll: {
    flex: 1,
    paddingHorizontal: 28,
  },
});

export default SettingsScreen;
