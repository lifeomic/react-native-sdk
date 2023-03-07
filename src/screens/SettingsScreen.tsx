import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
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
import { useStyles } from '../hooks/useStyles';
import { Theme } from '../components/BrandConfigProvider/theme/Theme';

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
  const { styles } = useStyles('SettingsScreen', defaultStyles);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <MainMenuItem
            title={t('settings-profile-row-title', 'Profile')}
            action={() => navigate('Profile')}
          />
          <Divider />
          <MainMenuItem
            title={account?.name || t('settings-account-selection', 'Accounts')}
            action={() => navigate('AccountSelection')}
          />
          <Divider />
        </ScrollView>
        <View style={styles.subMenuContainer}>
          <OAuthLogoutButton label={t('settings-logout', 'Logout')} />
          <View style={styles.versionContainer}>
            <Text testID={tID('version-text')}>
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
  const { styles } = useStyles('SettingsScreen', defaultStyles);

  return (
    <TouchableOpacity onPress={action} accessibilityRole="button">
      <View style={styles.mainMenuItem}>
        <Text style={styles.mainMenuItemText}>{title}</Text>
        {badge}
        <Text style={styles.arrow}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  const { styles } = useStyles('SettingsScreen', defaultStyles);

  return <View style={styles.divider} />;
}

const defaultStyles = (theme: Theme) => {
  const mainMenuItem: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'space-between',
  };

  const mainMenuItemText: TextStyle = {
    color: theme.colors.primary,
  };

  const subMenuContainer: ViewStyle = {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const arrow: TextStyle = {
    marginRight: 8,
    color: theme.colors.outline,
  };

  const container: ViewStyle = {
    flex: 1,
    marginTop: 8,
  };

  const versionContainer: ViewStyle = {
    paddingVertical: 14,
    marginTop: 28,
  };

  const scroll: ViewStyle = {
    flex: 1,
    paddingHorizontal: 28,
    flexGrow: 4,
  };

  const divider: ViewStyle = {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.outline,
  };

  return {
    mainMenuItem,
    mainMenuItemText,
    arrow,
    subMenuContainer,
    container,
    versionContainer,
    scroll,
    divider,
  };
};

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<'SettingsScreen', typeof defaultStyles> {}
}

export type SettingsScreenStyles = NamedStylesProp<typeof defaultStyles>;
