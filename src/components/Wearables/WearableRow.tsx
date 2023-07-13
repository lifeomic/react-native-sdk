import {
  ToggleWearableResult,
  WearableIntegration,
  WearableIntegrationStatus,
  EHRType,
} from './WearableTypes';
import React, { FC, useCallback, useState } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  SwitchProps,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WearableRowHeader } from './WearableRowHeader';
import { SwitchRow } from './SwitchRow';
import Issue from './icons/Issue';
import Info from './icons/Info';
import GoogleFit from './icons/vendorIcons/GoogleFit';
import { WearableRowDetailSection } from './WearableRowDetailSection';
import Fitbit from './icons/vendorIcons/Fitbit';
import Garmin from './icons/vendorIcons/Garmin';
import Google from './icons/vendorIcons/Google';
import Oura from './icons/vendorIcons/Oura';
import Biosense from './icons/vendorIcons/Biosense';
import KetoMojo from './icons/vendorIcons/KetoMojo';
import Dexcom from './icons/vendorIcons/Dexcom';
import { ToggleButton } from './ToggleButton';
import { t } from 'i18next';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';
import { useWearableLifecycleHooks } from './WearableLifecycleProvider';
import AppleHealth from './icons/vendorIcons/AppleHealth';

export interface WearableRowProps {
  switchProps?: SwitchProps;
  disabled?: boolean;
  onError?: (error: any, syncType?: string, enabled?: boolean) => any;
  onRefreshNeeded: () => any;
  onShowWearableAuth: (url: string) => any;
  onShowLearnMore: (url: string) => any;
  onToggleWearable: (
    ehrId: string,
    enabled: boolean,
  ) => Promise<ToggleWearableResult>;
  onToggleBackgroundSync?: (
    enabledWearable: WearableIntegration,
    enabled: boolean,
  ) => Promise<WearableIntegration>;
  onBackfillWearable?: (
    enabledWearable: WearableIntegration,
  ) => Promise<boolean>;
  styles?: any;
  wearable: WearableIntegration;
  isBackfillEnabled?: boolean;
}

/**
 * WearableRow is the heart of this library.  It renders a
 * single wearable user-configuration row which indicates
 * current status (on/off), error info (e.g. needs re-auth),
 * a description on how the integration works, and a "Learn
 * More" button.
 */
export const WearableRow: FC<WearableRowProps> = (props) => {
  const {
    disabled,
    onError,
    onRefreshNeeded,
    onShowWearableAuth,
    onShowLearnMore,
    onToggleWearable,
    onToggleBackgroundSync,
    onBackfillWearable,
    switchProps,
    isBackfillEnabled,
    wearable: wearableProp,
    styles: instanceStyles,
  } = props;

  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { onPreToggle } = useWearableLifecycleHooks();
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [wasBackfillRequested, setWasBackfillRequested] = useState(false);
  const [didBackfillFail, setDidBackfillFail] = useState<boolean>();

  const _onShowLearnMore = useCallback(
    (link: string) => () => {
      onShowLearnMore(link);
    },
    [onShowLearnMore],
  );

  const _isBackgroundSyncEnabled = useCallback(
    (enabledWearable: WearableIntegration) => {
      return !!enabledWearable.meta?.backgroundSync;
    },
    [],
  );

  const toggleWearable = useCallback(
    async (wearable: WearableIntegration, enabled: boolean) => {
      try {
        LayoutAnimation.easeInEaseOut();

        await onPreToggle(wearable, enabled);

        const result = await onToggleWearable(wearable.ehrId, enabled);
        if (result.authorizationUrl) {
          onShowWearableAuth(result.authorizationUrl);
        }
        onRefreshNeeded();
      } catch (error) {
        if (onError) {
          onError(error, wearable.ehrType, enabled);
        }
        onRefreshNeeded();
      }
    },
    [
      onToggleWearable,
      onShowWearableAuth,
      onRefreshNeeded,
      onError,
      onPreToggle,
    ],
  );

  const toggleBackgroundSync = useCallback(
    (wearable: WearableIntegration) => async (enabled: boolean) => {
      if (!onToggleBackgroundSync) {
        return;
      }
      try {
        LayoutAnimation.easeInEaseOut();

        wearable.meta = wearable.meta || {};
        wearable.meta.backgroundSync = enabled;
        await onToggleBackgroundSync(wearable, enabled);
        onRefreshNeeded();
      } catch (error) {
        if (onError) {
          onError(error, wearable.ehrType, enabled);
        }
        onRefreshNeeded();
      }
    },
    [onToggleBackgroundSync, onRefreshNeeded, onError],
  );

  const renderIntro = useCallback(
    (wearable: WearableIntegration) => {
      let intro: string | undefined;

      const standard =
        'Connecting {{wearableName}} allows you to sync data like {{supportedSyncTypes}}. You can disconnect from {{wearableName}} at any time from this screen.';

      switch (wearable.ehrType) {
        case EHRType.HealthKit: {
          // See https://developer.apple.com/design/human-interface-guidelines/healthkit/overview/
          intro = t(standard, {
            wearableName: wearable.name,
            supportedSyncTypes: t(
              'weight-sleep-activity-mindful-glucose',
              'weight, sleep, activity, mindful minutes, and blood glucose',
            ),
          });
          break;
        }
        case EHRType.ReadoutHealth: {
          intro = t(standard, {
            wearableName: wearable.name,
            supportedSyncTypes: t('breath-ketones', 'breath ketones'),
          });
          break;
        }
        case EHRType.Fitbit:
        case EHRType.Garmin: {
          intro = t(standard, {
            wearableName: wearable.name,
            supportedSyncTypes: t(
              'weight-sleep-activity',
              'weight, sleep, and activity',
            ),
          });
          break;
        }
        case EHRType.GoogleFit: {
          // See https://developers.google.com/fit/branding
          intro = t(
            'about-connecting-googlefit-message',
            'Google Fit is an open platform that lets you control your fitness data from multiple apps and devices.  Connecting to Google Fit allows you to sync data like weight, sleep, activity, mindful minutes, and blood glucose.  You can disconnect from Google Fit at any time from this screen.',
          );
          break;
        }
        case EHRType.Dexcom: {
          intro = t(standard, {
            wearableName: wearable.name,
            supportedSyncTypes: t('blood-glucose', 'blood glucose'),
          });
          break;
        }
        case EHRType.KetoMojo: {
          intro = t(standard, {
            wearableName: wearable.name,
            supportedSyncTypes: t(
              'blood-ketones-blood-glucose',
              'blood ketones and blood glucose',
            ),
          });
          break;
        }
        case EHRType.Oura: {
          intro = t(standard, {
            wearableName: wearable.name,
            supportedSyncTypes: t(
              'sleep-mindful-activity',
              'sleep, mindful minutes, and activity',
            ),
          });
          break;
        }
        default:
          break;
      }

      return (
        intro && (
          <Text
            style={styles.introDescription}
            testID={`intro-${wearable.ehrId}`}
          >
            {intro}
          </Text>
        )
      );
    },
    [styles.introDescription],
  );

  const renderLearnMore = useCallback(
    (enabledWearable: WearableIntegration) => {
      let description: string | undefined;
      let link: string | undefined;

      switch (enabledWearable.ehrType) {
        case EHRType.HealthKit: {
          description = t(
            'apple-learnmore',
            'Apple Health records will sync each time you open the app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-apple-health/';
          break;
        }
        case EHRType.Fitbit: {
          description = t(
            'fitbit-learnmore',
            "Fitbit records will be ingested once they are available from Fitbit's cloud. You may need to sync with the Fitbit app if records appear to be missing.",
          );
          link = 'https://lifeapps.io/ia/wearables-sync-fitbit/';
          break;
        }
        case EHRType.Oura: {
          description = t(
            'oura-learnmore',
            'Oura records will be ingested periodically in the cloud. You will need to sync with the Oura app for your records to be available.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-oura/';
          break;
        }
        case EHRType.Garmin: {
          description = t(
            'garmin-learnmore',
            'Garmin records will sync once they are available in the Garmin Connect app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-garmin/';
          break;
        }
        case EHRType.ReadoutHealth: {
          description = t(
            'readout-learnmore',
            'Readout Health records will be ingested periodically in the cloud. You will need to sync with the Biosense app for your records to be available.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-readout-health/';
          break;
        }
        case EHRType.KetoMojo: {
          description = t(
            'keto-mojo-learnmore',
            'Keto-Mojo records will sync once they are available in the MyMojoHealth app or Keto-Mojo Classic app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-keto-mojo/';
          break;
        }
        case EHRType.GoogleFit: {
          description = t(
            'google-fit-learnmore',
            'Google Fit records will be ingested periodically in the cloud. You may need to sync with the Google Fit app if records appear to be missing.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-google-fit/';
          break;
        }
        case EHRType.Dexcom: {
          description = t(
            'dexcom-learnmore',
            'Dexcom records will be ingested periodically in the cloud. You will need to sync with the Dexcom app, which will then impose a 3 hour delay when syncing your records.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-dexcom/';
          break;
        }
        default:
          break;
      }

      return (
        description &&
        link && (
          <WearableRowDetailSection icon={<Info />}>
            <Text
              style={styles.moreInfoDescription}
              testID={`desc-${wearableProp.ehrId}`}
            >
              {description}
            </Text>
            <TouchableOpacity
              testID={`info-link-${wearableProp.ehrId}`}
              onPress={_onShowLearnMore(link)}
            >
              <Text style={styles.learnMoreButton}>
                {t('learn-more', 'Learn More')}
              </Text>
            </TouchableOpacity>
          </WearableRowDetailSection>
        )
      );
    },
    [
      _onShowLearnMore,
      styles.learnMoreButton,
      styles.moreInfoDescription,
      wearableProp.ehrId,
    ],
  );

  const renderBackgroundSync = useCallback(
    (enabledWearable: WearableIntegration) => {
      const backgroundSyncEnabled = _isBackgroundSyncEnabled(enabledWearable);

      if (!onToggleBackgroundSync) {
        return null;
      }

      return (
        <WearableRowDetailSection
          icon={<Info />}
          styles={{
            iconWrapper: {
              marginTop: 6,
            },
          }}
        >
          <SwitchRow
            onValueChange={toggleBackgroundSync(wearableProp)}
            accessibilityLabel={t('toggle-wearable', {
              wearableName: t('background-sync', 'Background Sync'),
            })}
            disabled={disabled}
            testID={`toggle-${wearableProp.ehrId}-background-sync`}
            value={backgroundSyncEnabled}
            styles={{
              headerText: {
                fontWeight: 'normal',
              },
            }}
            title={t('background-sync', 'Background Sync')}
            {...switchProps}
          />
          {backgroundSyncEnabled && (
            <Text
              style={styles.backgroundSyncDescription}
              testID={`background-desc-${wearableProp.ehrId}`}
            >
              {t(
                'background-sync-message',
                'Records will sync in the background if allowed in device settings.',
              )}
            </Text>
          )}
        </WearableRowDetailSection>
      );
    },
    [
      _isBackgroundSyncEnabled,
      disabled,
      styles.backgroundSyncDescription,
      switchProps,
      toggleBackgroundSync,
      onToggleBackgroundSync,
      wearableProp,
    ],
  );

  const renderToggle = useCallback(
    (wearable: WearableIntegration) => {
      let buttonTitle = wearable.enabled
        ? t('Disconnect {{wearableName}}', { wearableName: wearable.name })
        : t('Sign in with {{wearableName}}', { wearableName: wearable.name });
      let icon: React.ReactNode | undefined;

      if (!wearable.enabled && wearable.ehrType === EHRType.GoogleFit) {
        buttonTitle = wearable.enabled
          ? t('Disconnect {{wearableName}}', { wearableName: wearable.name })
          : t('sign-in-with-google', 'Sign in with Google'); // NOTE: "Google" instead of "GoogleFit"
        icon = <Google />;
      }

      return (
        <ToggleButton
          testID={`toggle-${wearable.ehrId}`}
          accessibilityLabel={`Toggle ${wearable.name}`}
          title={buttonTitle}
          disabled={disabled}
          enabled={wearable.enabled}
          icon={icon}
          onPress={() => toggleWearable(wearable, !wearable.enabled)}
        />
      );
    },
    [toggleWearable, disabled],
  );

  const renderSyncError = useCallback(
    (auth = true) => {
      const authErrorText = t(
        'your-data-is-not-syncing-message',
        'Your data is not syncing. Please toggle back on to reauthorize.',
      );
      const noSyncTypesErrorText = t(
        'configure-data-to-sync-message',
        'Your data is not syncing because it is not configured as a Data Source above.',
      );

      const errorText = auth ? authErrorText : noSyncTypesErrorText;

      return (
        <WearableRowDetailSection icon={<Issue />}>
          <Text style={styles.errorText}>{errorText}</Text>
        </WearableRowDetailSection>
      );
    },
    [styles.errorText],
  );

  const renderBackfill = useCallback(
    (wearable: WearableIntegration) => {
      const isDisabled = (wearable.syncTypes?.length ?? 0) === 0;
      const Content = wasBackfillRequested ? (
        <Text
          style={styles.backfillDescription}
          testID={`backfill-desc-${wearable.ehrId}`}
        >
          {t(
            'wearable-backfill-success',
            'Your request was successfully submitted. It can take several hours for the data to be transferred completely.',
          )}
        </Text>
      ) : (
        <>
          <Text
            style={styles.backfillDescription}
            testID={`backfill-desc-${wearable.ehrId}`}
          >
            {t(
              'wearable-backfill-instructions',
              'This request pulls in the last 30 days of data from {{name}} and can only be performed once; configure all desired data sources before proceeding. Would you like to add this data now?',
              wearable,
            )}
          </Text>
          {didBackfillFail && (
            <Text
              style={[styles.backfillDescription, styles.backfillErrorText]}
              testID={`backfill-error-${wearable.ehrId}`}
            >
              {t(
                'wearable-backfill-failure',
                'We are unable to process your request at this time.',
                wearable,
              )}
            </Text>
          )}
          <ToggleButton
            testID={`backfill-${wearable.ehrId}`}
            accessibilityLabel={t(
              'wearable-backfill-button-a11y',
              'Add historical data for {{name}}',
              wearable,
            )}
            title={t('wearable-backfill-button', 'Add Historical Data')}
            enabled={false}
            disabled={isDisabled}
            loading={backfillLoading}
            onPress={async () => {
              setDidBackfillFail(false);
              setBackfillLoading(true);
              try {
                const succeeded = await onBackfillWearable?.(wearable);
                setWasBackfillRequested(succeeded ?? false);
                setDidBackfillFail(!succeeded);
              } catch (e) {
                console.warn('Failed to invoke backfill', e);
                setWasBackfillRequested(false);
                setDidBackfillFail(true);
              } finally {
                setBackfillLoading(false);
              }
            }}
            styles={{
              toggleButton: {
                ...styles.backfillButton,
                ...(backfillLoading && styles.backfillButtonLoading),
                ...(isDisabled && styles.backfillButtonLoading),
              },
              toggleText: styles.backfillButtonText,
            }}
          />
        </>
      );

      return (
        <>
          <View style={styles.divider} />
          {Content}
          <View style={styles.divider} />
        </>
      );
    },
    [
      onBackfillWearable,
      backfillLoading,
      wasBackfillRequested,
      didBackfillFail,
      styles.backfillButton,
      styles.backfillButtonLoading,
      styles.backfillButtonText,
      styles.backfillDescription,
      styles.backfillErrorText,
      styles.divider,
    ],
  );

  const getIcon = useCallback((ehrType: string) => {
    switch (ehrType) {
      case EHRType.HealthKit:
        return <AppleHealth />;
      case EHRType.Dexcom:
        return <Dexcom />;
      case EHRType.Fitbit:
        return <Fitbit />;
      case EHRType.Garmin:
        return <Garmin />;
      case EHRType.GoogleFit:
        return <GoogleFit />;
      case EHRType.KetoMojo:
        return <KetoMojo />;
      case EHRType.Oura:
        return <Oura />;
      case EHRType.ReadoutHealth:
        return <Biosense />;
      default:
        return undefined;
    }
  }, []);

  return (
    <View style={styles.container}>
      <WearableRowHeader
        testID={`header-${wearableProp.ehrId}`}
        title={wearableProp.name}
        icon={getIcon(wearableProp.ehrType)}
      />
      <View style={styles.detailsView}>
        {!wearableProp.enabled && renderIntro(wearableProp)}
        {wearableProp.enabled && renderLearnMore(wearableProp)}
        {wearableProp.enabled &&
          wearableProp.status ===
            WearableIntegrationStatus.NeedsAuthorization &&
          renderSyncError()}
        {wearableProp.enabled &&
          wearableProp.status !==
            WearableIntegrationStatus.NeedsAuthorization &&
          wearableProp.syncTypes?.length === 0 &&
          renderSyncError(false)}
        {wearableProp.enabled && renderBackgroundSync(wearableProp)}
        {wearableProp.enabled &&
          isBackfillEnabled &&
          renderBackfill(wearableProp)}
        {renderToggle(wearableProp)}
      </View>
    </View>
  );
};

const defaultStyles = createStyles('WearableRow', (theme) => ({
  moreInfoDescription: {},
  introDescription: {
    marginTop: theme.spacing.medium,
  },
  backgroundSyncDescription: {
    paddingTop: theme.spacing.small,
  },
  learnMoreButton: {
    paddingTop: theme.spacing.small,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  errorSection: {},
  errorText: {},
  container: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.medium,
    marginVertical: theme.spacing.extraSmall,
    padding: theme.spacing.small,
    minHeight: 52,
    borderRadius: 10,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  detailsView: {
    flexDirection: 'column',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '200%',
    marginLeft: -theme.spacing.large,
    marginTop: theme.spacing.extraSmall,
    backgroundColor: '#d7d7d7',
  },
  backfillDescription: {
    marginTop: theme.spacing.extraSmall,
  },
  backfillButton: {
    backgroundColor: 'rgb(54, 141, 24)',
    borderWidth: 0,
  },
  backfillButtonLoading: {
    backgroundColor: 'rgba(54, 141, 24, 0.2)',
  },
  backfillButtonDisabled: {
    backgroundColor: 'rgba(54, 141, 24, 0.2)',
  },
  backfillButtonText: {
    color: 'white',
  },
  backfillErrorText: {
    color: theme.colors.error,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type WearableRowStyles = NamedStylesProp<typeof defaultStyles>;
