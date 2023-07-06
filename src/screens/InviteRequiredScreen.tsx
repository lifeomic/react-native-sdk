import { t } from 'i18next';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import {
  ActivityIndicatorView,
  OAuthLogoutButton,
  OAuthLogoutButtonStyles,
  createStyles,
} from '../components';
import { tID } from '../common/testID';
import {
  useActiveAccount,
  useActiveProject,
  useConsent,
  useStyles,
} from '../hooks';
import { LoggedInRootScreenProps } from '../navigators/types';

export const InviteRequiredScreen = ({
  navigation,
}: LoggedInRootScreenProps<'InviteRequired'>) => {
  const {
    account,
    isLoading: isLoadingAccount,
    isFetched: isFetchedAccount,
  } = useActiveAccount();
  const {
    activeProject,
    isLoading: isLoadingProject,
    isFetched: isFetchedProject,
  } = useActiveProject();

  const loadingProject = !isFetchedProject || isLoadingProject;
  const loadingAccount = !isFetchedAccount || isLoadingAccount;
  const loadingAccountOrProject = loadingProject || loadingAccount;
  const hasAccountAndProject = !!(activeProject?.id && account?.id);

  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen, isLoading: loadingConsents } =
    useShouldRenderConsentScreen();

  const { styles } = useStyles(defaultStyles);

  useEffect(() => {
    if (!loadingAccountOrProject && !loadingConsents && hasAccountAndProject) {
      if (shouldRenderConsentScreen) {
        navigation.replace('screens/ConsentScreen');
      } else {
        navigation.replace('app');
      }
    }
  }, [
    account,
    activeProject,
    navigation,
    shouldRenderConsentScreen,
    loadingConsents,
    loadingAccountOrProject,
    hasAccountAndProject,
  ]);

  if (!loadingAccountOrProject && !hasAccountAndProject) {
    if (__DEV__) {
      console.info(
        `Invite required! User is not part of both an account AND project. \n Account: ${account?.id} Project: ${activeProject?.id}`,
      );
    }
    return (
      <View style={styles.containerView}>
        <Text style={styles.invitationLabel} testID={tID('invite-only-text')}>
          {t(
            'invite-required-text',
            'This app is only available to use by invitation. Please contact your administrator for access.',
          )}
        </Text>
        <OAuthLogoutButton
          label={t('settings-logout', 'Logout')}
          mode="contained"
          style={styles.oAuthLogout}
        />
      </View>
    );
  }

  return (
    <ActivityIndicatorView
      message={t('root-stack-waiting-for-queries', 'Loading')}
    />
  );
};

const defaultStyles = createStyles('InviteRequiredScreen', (theme) => ({
  containerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.medium,
  },
  invitationLabel: {
    textAlign: 'center',
  },
  oAuthLogout: {
    style: { marginTop: theme.spacing.small },
  } as OAuthLogoutButtonStyles,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type InviteRequiredScreenStyles = NamedStylesProp<typeof defaultStyles>;
