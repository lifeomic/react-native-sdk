import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SwitchProps,
  Text,
  View
} from 'react-native';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';
import i18n from 'format-message';
import {
  SyncTypeSettings,
  WearableIntegration,
  WearableIntegrationStatus
} from '@lifeomic/wearables-sync';
import { EHRType, WearableStateSyncType } from '@lifeomic/ehr-core';
import { Colors, Margin } from './defaultTheme';
import { WearableRow, WearableRowProps } from './WearableRow';
import { WearablesSyncModule } from './NativeWearablesSync';
import { SyncTypeSelectionView } from './SyncTypeSelectionView';

export interface WearablesViewProps extends Omit<WearableRowProps, 'wearable'> {
  /**
   * enableMultiWearable will enable support for users enabling multiple,
   * overlapping wearable integrations.  The user will need to choose which wearable
   * should sync/contributre to each overlapping syncType (e.g. activity, mindfulness, sleep)
   */
  enableMultiWearable?: boolean;
  loading: boolean;
  onSyncTypeSelectionsUpdate: (
    settings: Record<WearableStateSyncType, string>
  ) => any;
  styles?: any;
  wearables: WearableIntegration[];
  legacySort?: boolean;
  switchProps?: SwitchProps;
}

/**
 * WearablesView is the highest-level component you can use in
 * this library.  It will render everything related to wearables
 * configuration for a given user.  It is a composite component,
 * which can be replaced easily if needed.
 */
export const WearablesView: FC<WearablesViewProps> = (props) => {
  const [sanitizedWearables, setSanitizedWearables] = useState<
    WearableIntegration[]
  >([]);
  const [sanitizing, setSanitizing] = useState(false);

  const {
    enableMultiWearable,
    loading: wearablesLoading,
    nativeWearablesSync,
    onError,
    onRefreshNeeded,
    onSyncTypeSelectionsUpdate,
    styles: propStyles,
    wearables,
    legacySort,
    ...otherRowProps
  } = props;

  useEffect(() => {
    setSanitizing(true);
    sanitizeWearables(
      wearables,
      nativeWearablesSync,
      enableMultiWearable,
      legacySort
    )
      .then((result) => {
        setSanitizedWearables(result);
        setSanitizing(false);
      })
      .catch((error) => {
        if (onError) {
          onError(error);
        }
        setSanitizing(false);
      });
  }, [JSON.stringify(wearables)]);

  const updateSyncTypeSelections = useCallback(
    async (settings: SyncTypeSettings) => {
      try {
        await onSyncTypeSelectionsUpdate(settings);
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    },
    []
  );

  const styles = merge({}, defaultStyles, propStyles);
  const loading = wearablesLoading || sanitizing;
  const showSyncTypeSelections =
    enableMultiWearable &&
    sanitizedWearables.filter((w) => w.enabled).length > 0;

  return (
    <ScrollView style={styles.container} testID="wearables-screen-container">
      <View style={loading ? styles.visible : styles.hidden}>
        <ActivityIndicator
          size="large"
          animating={loading}
          hidesWhenStopped
          testID="wearables-loader"
        />
      </View>
      {showSyncTypeSelections && (
        <>
          <Text style={styles.sectionHeaderTop}>{i18n('Data Sources')}</Text>
          <SyncTypeSelectionView
            disabled={loading}
            onUpdate={updateSyncTypeSelections}
            selectionRowStyles={styles.selectionRowStyles}
            wearables={sanitizedWearables}
          />
        </>
      )}
      {sanitizedWearables.length > 0 && (
        <Text
          style={
            showSyncTypeSelections
              ? styles.sectionHeader
              : styles.sectionHeaderTop
          }
        >
          {i18n('Authorize')}
        </Text>
      )}
      {sanitizedWearables.map((wearable: WearableIntegration) => (
        <WearableRow
          disabled={loading}
          key={wearable.ehrType}
          onRefreshNeeded={onRefreshNeeded}
          styles={styles.wearableRow}
          wearable={wearable}
          nativeWearablesSync={nativeWearablesSync}
          {...otherRowProps}
        />
      ))}
    </ScrollView>
  );
};

/**
 * If writing your own version of WearablesView, make sure to
 * utilize this sanitization function which includes business
 * logic around only one wearable being enabled at a time.
 */
export const sanitizeWearables = async (
  wearables: WearableIntegration[],
  nativeWearablesSync?: WearablesSyncModule,
  enableMultiWearable?: boolean,
  legacySort?: boolean
) => {
  let resultItems = [...wearables];

  const healthKitAllowed =
    nativeWearablesSync && (await nativeWearablesSync.isHealthKitAllowed());
  const samsungHealthAllowed =
    nativeWearablesSync && (await nativeWearablesSync.isSamsungHealthAllowed());

  const readoutHealthEHR = wearables.find(
    (i) => i.ehrType === EHRType.ReadoutHealth
  );
  const ketoMojoEHR = resultItems.find((i) => i.ehrType === 'ketoMojo');

  if (!healthKitAllowed) {
    resultItems = resultItems.filter((i) => i.ehrType !== EHRType.HealthKit);
  }

  if (!samsungHealthAllowed) {
    resultItems = resultItems.filter(
      (i) => i.ehrType !== EHRType.SamsungHealth
    );
  }

  if (!enableMultiWearable) {
    // If any integrations are enabled, hide the others.
    const enabledItems = resultItems.filter((wearable) => {
      return (
        wearable.ehrType !== EHRType.ReadoutHealth &&
        wearable.ehrType !== EHRType.KetoMojo &&
        wearable.enabled &&
        wearable.status === WearableIntegrationStatus.Syncing
      );
    });
    if (enabledItems.length) {
      resultItems = enabledItems;
    }

    // Always display readoutHealth & ketoMojo, which are allowed to be on in addition to other integrations
    if (
      readoutHealthEHR &&
      !resultItems.find((w) => w.ehrId === readoutHealthEHR.ehrId)
    ) {
      resultItems.push(readoutHealthEHR);
    }
    if (
      ketoMojoEHR &&
      !resultItems.find((w) => w.ehrId === ketoMojoEHR.ehrId)
    ) {
      resultItems.push(ketoMojoEHR);
    }
  }

  if (legacySort) {
    return sortBy(resultItems, (item) => {
      const needsAttentionFlag =
        item.status === WearableIntegrationStatus.NeedsAuthorization ||
        item.syncTypes?.length === 0
          ? '0'
          : '1';
      const enabledFlag = item.enabled ? '0' : '1';
      const name = item.name;

      // NOTE: Sort by attention needed, enabled, then name (alphabetically):
      return `${needsAttentionFlag}${enabledFlag}${name}`;
    });
  }

  return sortBy(resultItems, (item) => item.name?.toLocaleLowerCase());
};

export const WearablesViewDefaultStyles = {
  container: {
    backgroundColor: Colors.containerBackground,
    flex: 1
  },
  visible: {
    overflow: 'hidden',
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  hidden: {
    overflow: 'hidden',
    minHeight: Margin.standard
  },
  sectionHeaderTop: {
    marginHorizontal: Margin.standard,
    marginBottom: Margin.small,
    fontSize: 28,
    fontWeight: '500'
  },
  sectionHeader: {
    marginHorizontal: Margin.standard,
    marginBottom: Margin.small,
    fontSize: 28,
    fontWeight: '500',
    marginTop: Margin.standard
  }
};
const defaultStyles = StyleSheet.create(WearablesViewDefaultStyles as any);
