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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OAuthLogoutButton } from '../components/OAuthLogoutButton';
import { tID } from '../common/testID';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { SettingsStackParamList } from '../navigators/SettingsStack';

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

type NavigationParams = NativeStackNavigationProp<
  SettingsStackParamList,
  'Settings'
>;

export const SettingsScreen = () => {
  const { account } = useActiveAccount();
  const { navigate } = useNavigation<NavigationParams>();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <MainMenuItem
            title={t('settings-profile-row-title', 'Profile')}
            action={() => navigate('Profile')}
          />
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
      </SafeAreaView>
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
