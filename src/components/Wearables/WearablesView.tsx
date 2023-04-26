import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  SwitchProps,
  Text,
  View,
} from 'react-native';
import { SyncTypeSettings, WearableIntegration } from './WearableTypes';
import { WearableStateSyncType } from './WearableTypes';
import { WearableRow, WearableRowProps } from './WearableRow';
import { SyncTypeSelectionView } from './SyncTypeSelectionView';
import { t } from 'i18next';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';
import { useWearableLifecycleHooks } from './WearableLifecycleProvider';

export interface WearablesViewProps extends Omit<WearableRowProps, 'wearable'> {
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
  const { sanitizeEHRs } = useWearableLifecycleHooks();

  const {
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
    sanitizeEHRs(wearables, legacySort)
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
  }, [legacySort, onError, wearables, sanitizeEHRs]);

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
  const showSyncTypeSelections = sanitizedWearables.some((w) => w.enabled);

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
