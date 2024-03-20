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
  const { textOverrides } = styles;

  return (
    <View style={styles.containerView}>
      <View style={styles.messageContainer}>
        <Text style={styles.invitationLabel} testID={tID('invite-only-text')}>
          {textOverrides?.message as string}
        </Text>
      </View>
      <OAuthLogoutButton
        label={textOverrides?.button as string}
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
    backgroundColor: theme.colors.elevation.level1,
  },
  messageContainer: {
    marginHorizontal: theme.spacing.medium,
  },
  invitationLabel: {
    textAlign: 'center',
  },
  oAuthLogout: {
    style: { marginTop: theme.spacing.small },
  } as OAuthLogoutButtonStyles,
  textOverrides: {
    message: t(
      'invite-required-text',
      'This app is only available to use by invitation. Please contact your administrator for access.',
    ),
    button: t('settings-logout', 'Logout'),
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type InviteRequiredScreenStyles = NamedStylesProp<typeof defaultStyles>;
