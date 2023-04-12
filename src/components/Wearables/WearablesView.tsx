import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  SwitchProps,
  Text,
  View,
} from 'react-native';
import sortBy from 'lodash/sortBy';
import {
  SyncTypeSettings,
  WearableIntegration,
  WearableIntegrationStatus,
} from './WearableTypes';
import { EHRType, WearableStateSyncType } from './WearableTypes';
import { WearableRow, WearableRowProps } from './WearableRow';
import { SyncTypeSelectionView } from './SyncTypeSelectionView';
import { t } from 'i18next';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface WearablesViewProps extends Omit<WearableRowProps, 'wearable'> {
  /**
   * enableMultiWearable will enable support for users enabling multiple,
   * overlapping wearable integrations.  The user will need to choose which wearable
   * should sync/contributre to each overlapping syncType (e.g. activity, mindfulness, sleep)
   */
  enableMultiWearable?: boolean;
  loading: boolean;
  onSyncTypeSelectionsUpdate: (
    settings: Record<WearableStateSyncType, string>,
  ) => any;
  styles?: WearablesViewStyles;
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
    onError,
    onRefreshNeeded,
    onSyncTypeSelectionsUpdate,
    styles: instanceStyles,
    wearables,
    legacySort,
    ...otherRowProps
  } = props;

  useEffect(() => {
    setSanitizing(true);
    sanitizeWearables(wearables, enableMultiWearable, legacySort)
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
  }, [enableMultiWearable, legacySort, onError, wearables]);

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
    [onError, onSyncTypeSelectionsUpdate],
  );

  const { styles } = useStyles(defaultStyles, instanceStyles);
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
          <Text style={styles.sectionHeaderTop}>
            {t('data-sources', 'Data Sources')}
          </Text>
          <SyncTypeSelectionView
            disabled={loading}
            onUpdate={updateSyncTypeSelections}
            styles={styles.syncTypeSelectionView}
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
          {t('authorize', 'Authorize')}
        </Text>
      )}
      {sanitizedWearables.map((wearable: WearableIntegration) => (
        <WearableRow
          disabled={loading}
          key={wearable.ehrType}
          onRefreshNeeded={onRefreshNeeded}
          styles={styles.wearableRow}
          wearable={wearable}
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
  enableMultiWearable?: boolean,
  legacySort?: boolean,
) => {
  let resultItems = [...wearables];
  const readoutHealthEHR = wearables.find(
    (i) => i.ehrType === EHRType.ReadoutHealth,
  );
  const ketoMojoEHR = resultItems.find((i) => i.ehrType === 'ketoMojo');

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

const defaultStyles = createStyles('WearablesView', (theme) => ({
  container: {
    backgroundColor: theme.colors.surfaceVariant,
    flex: 1,
  },
  visible: {
    overflow: 'hidden',
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    overflow: 'hidden',
    minHeight: 16,
  },
  sectionHeaderTop: {
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.extraSmall,
    fontSize: 28,
    fontWeight: '500',
  },
  sectionHeader: {
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.extraSmall,
    fontSize: 28,
    fontWeight: '500',
    marginTop: theme.spacing.medium,
  },
  wearableRow: {},
  syncTypeSelectionView: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type WearablesViewStyles = NamedStylesProp<typeof defaultStyles>;
