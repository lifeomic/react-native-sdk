import { t } from 'i18next';
import { SettingsStack } from './SettingsStack';
import { HomeStack } from './HomeStack';
import { NotificationsStack } from './NotificationsStack';
import { Icons } from '../components/BrandConfigProvider';
import { NavigationTab } from '../common/DeveloperConfig';
import { Bell, Home, Settings } from '@lifeomic/chromicons-native';

export function getDefaultTabs(icons: Partial<Icons> = {}) {
  const defaults: NavigationTab[] = [
    {
      name: 'HomeTab',
      component: HomeStack,
      label: t('tabs-home', 'Home'),
      icon: icons.Home ?? Home,
      color: 'red',
      headerShown: false,
    },
    {
      name: 'NotificationsTab',
      component: NotificationsStack,
      label: t('tabs-notifications', 'Notifications'),
      icon: icons.Bell ?? Bell,
      headerShown: false,
    },
    {
      name: 'SettingsTab',
      component: SettingsStack,
      label: t('tabs-settings', 'Settings'),
      icon: icons.Settings ?? Settings,
      headerShown: false,
    },
  ];
  return defaults;
}
