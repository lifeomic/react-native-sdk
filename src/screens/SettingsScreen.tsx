import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { t } from 'i18next';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OAuthLogoutButton } from '../components/OAuthLogoutButton';
import { tID } from '../common/testID';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { SettingsStackParamList } from '../navigators/SettingsStack';
import { useStyles } from '../hooks/useStyles';
import { Theme, createStyles } from '../components/BrandConfigProvider';
import { Text, Divider } from 'react-native-paper';

const versionNumber = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const fullVersion = versionNumber + ' (' + buildNumber + ')';

type NavigationParams = NativeStackNavigationProp<
  SettingsStackParamList,
  'Settings'
>;

export const SettingsScreen = () => {
  const { account } = useActiveAccount();
  const { navigate } = useNavigation<NavigationParams>();
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <MainMenuItem
            title={t('settings-profile-row-title', 'Profile')}
            action={() => navigate('Settings/Profile')}
          />
          <Divider />
          <MainMenuItem
            title={account?.name || t('settings-account-selection', 'Accounts')}
            action={() => navigate('Settings/AccountSelection')}
          />
          <Divider />
          <MainMenuItem
            title={t('settings-sync-data', 'Sync Data')}
            action={() => navigate('Settings/Wearables')}
          />
          <Divider />
        </ScrollView>
        <View style={styles.subMenuContainer}>
          <OAuthLogoutButton
            label={t('settings-logout', 'Logout')}
            mode="outlined"
          />
          <View style={styles.versionContainer}>
            <Text variant="bodySmall" testID={tID('version-text')}>
              {t('settings-version', 'Version {{ version }}', {
                version: fullVersion,
              })}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

interface Props {
  title: string;
  action?: () => void;
  badge?: React.ReactNode;
}

function MainMenuItem({ title, action, badge }: Props) {
  const { styles } = useStyles(defaultStyles);

  return (
    <TouchableOpacity onPress={action} accessibilityRole="button">
      <View style={styles.mainMenuItem}>
        <Text variant="titleMedium" style={styles.mainMenuItemText}>
          {title}
        </Text>
        {badge}
      </View>
    </TouchableOpacity>
  );
}

const defaultStyles = createStyles('SettingsScreen', (theme: Theme) => ({
  mainMenuItem: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  mainMenuItemText: {
    color: theme.colors.primary,
  },
  subMenuContainer: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    marginTop: 8,
  },
  versionContainer: {
    paddingVertical: 14,
    marginTop: 28,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 28,
    flexGrow: 4,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type SettingsScreenStyles = NamedStylesProp<typeof defaultStyles>;
