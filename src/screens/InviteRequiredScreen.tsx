import { t } from 'i18next';
import React from 'react';
import { Text, View } from 'react-native';
import {
  OAuthLogoutButton,
  OAuthLogoutButtonStyles,
} from '../components/OAuthLogoutButton';
import { createStyles } from '../components/BrandConfigProvider';
import { tID } from '../common/testID';
import { useStyles } from '../hooks/useStyles';
import { _sdkAnalyticsEvent } from '../common/Analytics';

export const InviteRequiredScreen = () => {
  const { styles } = useStyles(defaultStyles);
  _sdkAnalyticsEvent.track('InviteRequiredScreenPresented', {});

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
