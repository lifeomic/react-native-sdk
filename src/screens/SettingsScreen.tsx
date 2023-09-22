import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { t } from 'i18next';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OAuthLogoutButton } from '../components/OAuthLogoutButton';
import { tID } from '../common/testID';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useStyles } from '../hooks/useStyles';
import { Theme, createStyles } from '../components/BrandConfigProvider';
import { Text, Divider } from 'react-native-paper';
import { SettingsStackScreenProps } from '../navigators/types';
import { useWearables } from '../hooks/useWearables';
import { openURL } from '../common/urls';
import { useActiveConfig } from '../hooks/useActiveConfig';
import { useSession } from '../hooks/useSession';

const versionNumber = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const fullVersion = versionNumber + ' (' + buildNumber + ')';

export const SettingsScreen = ({
  navigation,
}: SettingsStackScreenProps<'Settings'>) => {
  const { account } = useActiveAccount();
  const { styles } = useStyles(defaultStyles);
  const { useWearableIntegrationsQuery } = useWearables();
  const { data: wearablesData } = useWearableIntegrationsQuery();
  const { appConfig } = useActiveConfig();
  const supportLink = appConfig?.supportLink;
  const { clearSession } = useSession();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <MainMenuItem
            title={t('settings-profile-row-title', 'Profile')}
            action={() => navigation.navigate('Settings/Profile')}
          />
          <Divider />
          <MainMenuItem
            title={account?.name || t('settings-account-selection', 'Accounts')}
            action={() => navigation.navigate('Settings/AccountSelection')}
          />
          {!!wearablesData?.items?.length && (
            <>
              <Divider />
              <MainMenuItem
                title={t('settings-sync-data', 'Sync Data')}
                action={() => navigation.navigate('Settings/Wearables')}
              />
            </>
          )}
          {!!supportLink && (
            <>
              <Divider />
              <MainMenuItem
                title={t('settings-support', 'Support')}
                action={() => openURL(supportLink)}
              />
            </>
          )}
          {{ __DEV__ } && (
            <>
              <Divider />
              <MainMenuItem
                title={'Clear Session Cache'}
                action={() => clearSession()}
              />
            </>
          )}
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
      <View style={styles.mainMenuItemView}>
        <Text variant="titleMedium" style={styles.mainMenuItemText}>
          {title}
        </Text>
        {badge}
      </View>
    </TouchableOpacity>
  );
}

const defaultStyles = createStyles('SettingsScreen', (theme: Theme) => ({
  mainMenuItemView: {
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
