import {
  ToggleWearableResult,
  WearableIntegration,
  WearableIntegrationStatus,
} from '@lifeomic/wearables-sync';
import React, { FC, useCallback } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  SwitchProps,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import i18n from 'format-message';
import merge from 'lodash/merge';
import { WearableRowHeader } from './WearableRowHeader';
import { SwitchRow } from './SwitchRow';
import { Colors, Margin, Padding } from './defaultTheme';
import { WearablesSyncModule } from './NativeWearablesSync';
import { EHRType, WearableStateSyncType } from '@lifeomic/ehr-core';
import Issue from './icons/Issue';
import Info from './icons/Info';
import GoogleFit from './icons/vendorIcons/GoogleFit';
import AppleHealth from './icons/vendorIcons/AppleHealth';
import { WearableRowDetailSection } from './WearableRowDetailSection';
import Fitbit from './icons/vendorIcons/Fitbit';
import Garmin from './icons/vendorIcons/Garmin';
import Google from './icons/vendorIcons/Google';
import Oura from './icons/vendorIcons/Oura';
import Biosense from './icons/vendorIcons/Biosense';
import KetoMojo from './icons/vendorIcons/KetoMojo';
import SamsungHealth from './icons/vendorIcons/SamsungHealth';
import Dexcom from './icons/vendorIcons/Dexcom';
import { ToggleButton } from './ToggleButton';

export interface WearableRowProps {
  switchProps?: SwitchProps;
  disabled?: boolean;
  nativeSyncTypesToRequest?: string[];
  nativeWearablesSync?: WearablesSyncModule;
  onError?: (error: Error, syncType?: string, enabled?: boolean) => any;
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
  styles?: any;
  wearable: WearableIntegration;
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
    nativeSyncTypesToRequest,
    nativeWearablesSync,
    onError,
    onRefreshNeeded,
    onShowWearableAuth,
    onShowLearnMore,
    onToggleWearable,
    onToggleBackgroundSync,
    switchProps,
    wearable,
  } = props;

  const styles = merge({}, defaultStyles, props.styles);

  const _handleNativePermissions = useCallback(
    async (enabled: boolean) => {
      if (
        !nativeWearablesSync ||
        !nativeSyncTypesToRequest ||
        !nativeSyncTypesToRequest.length
      ) {
        return;
      }
      if (
        enabled === true &&
        wearable.ehrType === EHRType.HealthKit &&
        (await nativeWearablesSync.isHealthKitAllowed())
      ) {
        await nativeWearablesSync.authorizeHealthKit(nativeSyncTypesToRequest);
      } else if (wearable.ehrType === EHRType.SamsungHealth) {
        if (enabled === true) {
          const permissions = [] as string[];
          nativeSyncTypesToRequest.forEach((type) => {
            switch (type) {
              case WearableStateSyncType.BodyMass:
                permissions.push('weight');
                break;
              case WearableStateSyncType.SleepAnalysis:
                permissions.push('sleep');
                break;
              case WearableStateSyncType.Workout:
                permissions.push('exercise');
                break;
              default:
                // Do not add unsupported types
                break;
            }
          });
          await nativeWearablesSync.requestPermissions(
            EHRType.SamsungHealth,
            permissions,
          );
        }
      }
    },
    [nativeWearablesSync, nativeSyncTypesToRequest],
  );

  const _onShowLearnMore = useCallback(
    (link: string) => () => {
      onShowLearnMore(link);
    },
    [onShowLearnMore],
  );

  const _allowsBackgroundSync = useCallback(
    (wearable: WearableIntegration) => {
      return (
        onToggleBackgroundSync &&
        // TODO: add EHR prop instead of this
        wearable.ehrType === EHRType.HealthKit
      );
    },
    [onToggleBackgroundSync],
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

        // Get the native permissions dialog showing as soon as possible:
        await _handleNativePermissions(enabled);

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
      _handleNativePermissions,
      onToggleWearable,
      onShowWearableAuth,
      onRefreshNeeded,
      onError,
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

  const renderIntro = useCallback((wearable: WearableIntegration) => {
    let intro: string | undefined;

    const standard =
      'Connecting {wearableName} allows you to sync data like {supportedSyncTypes}. You can disconnect from {wearableName} at any time from this screen.';

    switch (wearable.ehrType) {
      case EHRType.HealthKit: {
        // See https://developer.apple.com/design/human-interface-guidelines/healthkit/overview/
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n(
            'weight, sleep, activity, mindful minutes, and blood glucose',
          ),
        });
        break;
      }
      case EHRType.ReadoutHealth: {
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n('breath ketones'),
        });
        break;
      }
      case EHRType.Fitbit:
      case EHRType.Garmin: {
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n('weight, sleep, and activity'),
        });
        break;
      }
      case EHRType.GoogleFit: {
        // See https://developers.google.com/fit/branding
        intro = i18n(
          'Google Fit is an open platform that lets you control your fitness data from multiple apps and devices.  Connecting to Google Fit allows you to sync data like weight, sleep, activity, mindful minutes, and blood glucose.  You can disconnect from Google Fit at any time from this screen.',
        );
        break;
      }
      case EHRType.Dexcom: {
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n('blood glucose'),
        });
        break;
      }
      case EHRType.KetoMojo: {
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n('blood ketones and blood glucose'),
        });
        break;
      }
      case EHRType.Oura: {
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n('sleep, mindful minutes, and activity'),
        });
        break;
      }
      case EHRType.SamsungHealth: {
        intro = i18n(standard, {
          wearableName: wearable.name,
          supportedSyncTypes: i18n('weight, activity, and sleep'),
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
  }, []);

  const renderLearnMore = useCallback(
    (enabledWearable: WearableIntegration) => {
      let description: string | undefined;
      let link: string | undefined;

      switch (enabledWearable.ehrType) {
        case EHRType.HealthKit: {
          description = i18n(
            'Apple Health records will sync each time you open the app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-apple-health/';
          break;
        }
        case EHRType.Fitbit: {
          description = i18n(
            "Fitbit records will be ingested once they are available from Fitbit's cloud. You may need to sync with the Fitbit app if records appear to be missing.",
          );
          link = 'https://lifeapps.io/ia/wearables-sync-fitbit/';
          break;
        }
        case EHRType.Oura: {
          description = i18n(
            'Oura records will be ingested periodically in the cloud. You will need to sync with the Oura app for your records to be available.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-oura/';
          break;
        }
        case EHRType.Garmin: {
          description = i18n(
            'Garmin records will sync once they are available in the Garmin Connect app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-garmin/';
          break;
        }
        case EHRType.ReadoutHealth: {
          description = i18n(
            'Readout Health records will be ingested periodically in the cloud. You will need to sync with the Biosense app for your records to be available.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-readout-health/';
          break;
        }
        case EHRType.KetoMojo: {
          description = i18n(
            'Keto-Mojo records will sync once they are available in the MyMojoHealth app or Keto-Mojo Classic app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-keto-mojo/';
          break;
        }
        case EHRType.SamsungHealth: {
          description = i18n(
            'Samsung Health records will sync each time you open the app.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-shealth/';
          break;
        }
        case EHRType.GoogleFit: {
          description = i18n(
            'Google Fit records will be ingested periodically in the cloud. You may need to sync with the Google Fit app if records appear to be missing.',
          );
          link = 'https://lifeapps.io/ia/wearables-sync-google-fit/';
          break;
        }
        case EHRType.Dexcom: {
          description = i18n(
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
              testID={`desc-${wearable.ehrId}`}
            >
              {description}
            </Text>
            <TouchableOpacity
              testID={`info-link-${wearable.ehrId}`}
              onPress={_onShowLearnMore(link)}
            >
              <Text style={styles.learnMoreButton}>{i18n('Learn More')}</Text>
            </TouchableOpacity>
          </WearableRowDetailSection>
        )
      );
    },
    [],
  );

  const renderBackgroundSync = useCallback(
    (enabledWearable: WearableIntegration) => {
      const backgroundSyncEnabled = _isBackgroundSyncEnabled(enabledWearable);

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
            onValueChange={toggleBackgroundSync(wearable)}
            accessibilityLabel={i18n('Toggle {wearableName} background sync', {
              wearableName: i18n('Background Sync'),
            })}
            disabled={disabled}
            testID={`toggle-${wearable.ehrId}-background-sync`}
            value={backgroundSyncEnabled}
            styles={{
              headerText: {
                fontWeight: 'normal',
              },
            }}
            title={i18n('Background Sync')}
            {...switchProps}
          />
          {backgroundSyncEnabled && (
            <Text
              style={styles.backgroundSyncDescription}
              testID={`background-desc-${wearable.ehrId}`}
            >
              {i18n(
                'Records will sync in the background if allowed in device settings.',
              )}
            </Text>
          )}
        </WearableRowDetailSection>
      );
    },
    [_isBackgroundSyncEnabled, toggleBackgroundSync],
  );

  const renderToggle = useCallback(
    (wearable: WearableIntegration) => {
      let buttonTitle = wearable.enabled
        ? i18n('Disconnect {wearableName}', { wearableName: wearable.name })
        : i18n('Sign in with {wearableName}', { wearableName: wearable.name });
      let icon: React.ReactNode | undefined;

      if (
        (!wearable.enabled && wearable.ehrType === EHRType.HealthKit) ||
        wearable.ehrType === EHRType.SamsungHealth
      ) {
        buttonTitle = i18n('Connect to {wearableName}', {
          wearableName: wearable.name,
        });
      }

      if (!wearable.enabled && wearable.ehrType === EHRType.GoogleFit) {
        buttonTitle = wearable.enabled
          ? i18n('Disconnect {wearableName}', { wearableName: wearable.name })
          : i18n('Sign in with Google'); // NOTE: "Google" instead of "GoogleFit"
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
    [toggleWearable, wearable.enabled, disabled],
  );

  const renderSyncError = useCallback((auth = true) => {
    const authErrorText = i18n(
      'Your data is not syncing. Please toggle back on to reauthorize.',
    );
    const noSyncTypesErrorText = i18n(
      'Your data is not syncing because it is not configured as a Data Source above.',
    );

    const errorText = auth ? authErrorText : noSyncTypesErrorText;

    return (
      <WearableRowDetailSection icon={<Issue />}>
        <Text style={styles.errorText}>{errorText}</Text>
      </WearableRowDetailSection>
    );
  }, []);

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
      case EHRType.SamsungHealth:
        return <SamsungHealth />;
      default:
        return undefined;
    }
  }, []);

  return (
    <View style={styles.container}>
      <WearableRowHeader
        testID={`header-${wearable.ehrId}`}
        title={wearable.name}
        icon={getIcon(wearable.ehrType)}
      />
      <View style={styles.details}>
        {!wearable.enabled && renderIntro(wearable)}
        {wearable.enabled && renderLearnMore(wearable)}
        {wearable.enabled &&
          wearable.status === WearableIntegrationStatus.NeedsAuthorization &&
          renderSyncError()}
        {wearable.enabled &&
          wearable.status !== WearableIntegrationStatus.NeedsAuthorization &&
          wearable.syncTypes?.length === 0 &&
          renderSyncError(false)}
        {wearable.enabled &&
          _allowsBackgroundSync(wearable) &&
          renderBackgroundSync(wearable)}
        {renderToggle(wearable)}
      </View>
    </View>
  );
};

export const WearableRowDefaultStyles = {
  moreInfoDescription: {},
  introDescription: {
    marginTop: Margin.standard,
  },
  backgroundSyncDescription: {
    paddingTop: Padding.medium,
  },
  learnMoreButton: {
    paddingTop: Padding.medium,
    fontWeight: '700',
    color: Colors.link,
  },
  errorSection: {},
  container: {
    backgroundColor: Colors.rowBackground,
    marginHorizontal: Margin.standard,
    marginVertical: Margin.small,
    padding: Padding.medium,
    minHeight: 52,
    borderRadius: 10,
    flexDirection: 'column',
  },
  details: {
    flexDirection: 'column',
  },
};
const defaultStyles = StyleSheet.create(WearableRowDefaultStyles as any);
