import React, { useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { t } from 'i18next';
import Markdown from 'react-native-markdown-display';
import { Button } from 'react-native-paper';
import { ActivityIndicatorView, createStyles } from '../components';
import {
  useStyles,
  useConsent,
  useOAuthFlow,
  useOnboardingCourse,
  createConsentPatch,
} from '../hooks';
import type { ConsentAndForm } from '../hooks/useConsent';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { LoggedInRootScreenProps } from '../navigators/types';

export const ConsentScreen = ({
  navigation,
  route,
}: LoggedInRootScreenProps<'screens/ConsentScreen'>) => {
  const { styles } = useStyles(defaultStyles);
  const { CustomConsentScreen } = useDeveloperConfig();
  const { useShouldRenderConsentScreen, useUpdateProjectConsentDirective } =
    useConsent();
  const {
    shouldRenderConsentScreen,
    consentDirectives,
    isLoading: loadingDirectives,
  } = useShouldRenderConsentScreen();
  const updateConsentDirectiveMutation = useUpdateProjectConsentDirective({
    onSuccess: (_, { status }) => {
      if (status === 'rejected') {
        return logout({});
      }
    },
  });

  const { logout } = useOAuthFlow();
  const { shouldLaunchOnboardingCourse } = useOnboardingCourse();

  // Handle navigation when there
  // are no consents left to present
  useEffect(() => {
    if (!shouldRenderConsentScreen) {
      if (route.params?.noNavOnAccept) {
        navigation.pop();
        return;
      }
      const nextRoute = shouldLaunchOnboardingCourse
        ? 'screens/OnboardingCourseScreen'
        : 'app';
      navigation.replace(nextRoute);
    }
  }, [
    navigation,
    route.params?.noNavOnAccept,
    shouldLaunchOnboardingCourse,
    shouldRenderConsentScreen,
  ]);

  const consentToPresent = useMemo(
    () => consentDirectives?.[0],
    [consentDirectives],
  );

  const updateConsentDirective = useCallback(
    (accept: boolean) => {
      if (!consentToPresent?.id) {
        return;
      }
      updateConsentDirectiveMutation.mutate(
        createConsentPatch(consentToPresent.id, accept),
      );
    },
    [updateConsentDirectiveMutation, consentToPresent],
  );

  const acceptConsent = useCallback(() => {
    updateConsentDirective(true);
  }, [updateConsentDirective]);

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
          onPress: () => {
            updateConsentDirective(false);
          },
        },
      ],
    );
  }, [updateConsentDirective]);

  const consentText = consentToPresent?.form?.item?.find(
    (f) => f.linkId === 'terms',
  )?.text;
  const acceptanceItems = consentToPresent?.form?.item
    ?.filter((f) =>
      f.code?.find(
        (c) =>
          c.system === 'http://lifeomic.com/fhir/consent-form-item' &&
          c.code === 'Acceptance',
      ),
    )
    .slice(0, 2);

  if (loadingDirectives || !consentText) {
    return (
      <ActivityIndicatorView
        message={t('consent-screen-loading-consent', 'Loading consent')}
      />
    );
  }

  if (CustomConsentScreen) {
    return (
      <CustomConsentScreen
        consentForm={consentToPresent}
        acceptConsent={acceptConsent}
        declineConsent={declineConsent}
        isLoadingUpdateConsent={updateConsentDirectiveMutation.isLoading}
      />
    );
  }

  return (
    <View style={styles.view}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.consentTextContainer}>
          <Text>
            <Markdown>{consentText}</Markdown>
          </Text>
        </View>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        {acceptanceItems?.map(
          (item) =>
            item.text && (
              <Text style={styles.acceptText} key={item.linkId}>
                {item.text}
              </Text>
            ),
        )}
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
    flex: 1,
  },
  scrollView: {},
  consentTextContainer: {
    margin: theme.spacing.large,
  },
  acceptText: {
    marginBottom: theme.spacing.large,
  },
  buttonsContainer: {
    margin: theme.spacing.large,
  },
  agreeButton: {},
  declineButton: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ConsentScreenStyles = NamedStylesProp<typeof defaultStyles>;

export type CustomConsentScreenProps = {
  /**
   * The full Consent and Questionnaire FHIR Resources pertaining to the
   * consent form. Terms and acceptance text can be derived from here
   */
  consentForm: ConsentAndForm | undefined;
  /** Mutation to accept consent is in flight */
  isLoadingUpdateConsent: boolean;
  /** Mutation to accept consent */
  acceptConsent: () => void;
  /**
   * Warns user with system alert that app can not be used without
   * accepting consent and continuing will log them out
   */
  declineConsent: () => void;
};
