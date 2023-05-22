import React, { useCallback } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { t } from 'i18next';
import Markdown from 'react-native-markdown-display';
import { Button } from 'react-native-paper';
import { ActivityIndicatorView, createStyles } from '../components';
import { useStyles, useConsent, useOAuthFlow } from '../hooks';
import { LoggedInRootScreenProps } from '../navigators/types';

export const ConsentScreen = ({
  navigation,
}: LoggedInRootScreenProps<'screens/ConsentScreen'>) => {
  const { styles } = useStyles(defaultStyles);
  const { useDefaultConsent, useUpdateProjectConsentDirective } = useConsent();
  const { data: defaultConsentData, isLoading: loadingDefaultConsent } =
    useDefaultConsent();
  const updateConsentDirectiveMutation = useUpdateProjectConsentDirective();
  const { logout } = useOAuthFlow();

  const updateConsentDirective = useCallback(
    (accept: boolean) => updateConsentDirectiveMutation.mutateAsync(accept),
    [updateConsentDirectiveMutation],
  );

  const acceptConsent = useCallback(async () => {
    await updateConsentDirective(true);
    navigation.replace('app');
  }, [updateConsentDirective, navigation]);

  const declineConsent = useCallback(() => {
    Alert.alert(
      t('consent-decline-alert-title', 'Please confirm'),
      t(
        'consent-decline-alert-msg',
        'Declining the consent will result in you being logged out of the application. Would you like to continue?',
      ),
      [
        {
          text: t('cancel', 'Cancel'),
          style: 'cancel',
          isPreferred: true,
        },
        {
          text: t('logout', 'Logout'),
          style: 'destructive',
          onPress: async () => {
            await updateConsentDirective(false);
            await logout({});
          },
        },
      ],
    );
  }, [logout, updateConsentDirective]);

  const consentText = defaultConsentData?.item?.[0].text;
  if (loadingDefaultConsent || !consentText) {
    return (
      <ActivityIndicatorView
        message={t('consent-screen-loading-consent', 'Loading consent')}
      />
    );
  }

  return (
    <View style={styles.view}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text>
          <Markdown>{consentText}</Markdown>
        </Text>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={acceptConsent}
          loading={updateConsentDirectiveMutation.isLoading}
        >
          {t('consent-Agree', 'Agree')}
        </Button>
        <Button
          onPress={declineConsent}
          loading={updateConsentDirectiveMutation.isLoading}
        >
          {t('consent-decline', 'Decline')}
        </Button>
      </View>
    </View>
  );
};

const defaultStyles = createStyles('ConsentScreen', (theme) => ({
  view: {
    marginHorizontal: theme.spacing.large,
    flex: 1,
  },
  scrollView: {
    paddingVertical: theme.spacing.large,
  },
  buttonsContainer: {
    marginVertical: theme.spacing.large,
  },
  agreeButton: {},
  declineButton: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TileStyles = NamedStylesProp<typeof defaultStyles>;