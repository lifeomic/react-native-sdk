import React, { FC, useCallback, useState } from 'react';
import { View, ActivityIndicator, Switch } from 'react-native';
import { t } from '../../../../lib/i18n';
import { Text } from '../styles';
import { Tracker, isInstalledMetric } from '../services/TrackTileService';
import { useTrackers } from '../hooks/useTrackers';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { ManageTrackerRow } from './ManageTrackerRow';
import { useSyncTrackerOrder } from './useSyncTrackerOrder';
import { tID } from '../common/testID';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

export type ManageTrackersProps = {
  trackerRequestMeta?: ReturnType<typeof useTrackers>;
  onOpenTracker: (metric: Tracker) => void;
  hasReorderError?: boolean;
};

export const ManageTrackers: FC<ManageTrackersProps> = (props) => {
  const { onOpenTracker, trackerRequestMeta } = props;
  const { styles } = useStyles(defaultStyles);
  const [isReordering, setIsReordering] = useState(false);

  const { loading, trackers, error } = useTrackers(trackerRequestMeta);
  const [orderState, setOrderState] = useState<Tracker[] | undefined>();

  const {
    syncTrackerOrder,
    loading: reorderSaving,
    hasError: hasReorderError = props.hasReorderError,
  } = useSyncTrackerOrder(orderState);

  const setOrderingState = useCallback(
    async (reordering: boolean) => {
      setIsReordering(reordering);

      if (reordering) {
        setOrderState(() => trackers?.filter(isInstalledMetric));
      } else {
        await syncTrackerOrder();
        setOrderState((ts) =>
          ts?.concat(trackers.filter((tracker) => !isInstalledMetric(tracker))),
        );
      }
    },
    [trackers, syncTrackerOrder],
  );

  const trackerList = orderState ?? trackers;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="semibold" style={styles.headerText}>
          {t('track-tile.your-active-items', 'Your active items')}
        </Text>
        <View style={styles.headerReorderContainer}>
          <Text
            accessible={false}
            variant="semibold"
            style={styles.headerReorderText}
          >
            {t('track-tile.reorder', 'Reorder')}
          </Text>
          <Switch
            testID={tID('reorder-trackers-switch')}
            accessibilityLabel={
              isReordering
                ? t('track-tile.save-tracker-order', 'Save tracker order')
                : t('track-tile.reorder-trackers', 'Reorder trackers')
            }
            value={isReordering}
            onValueChange={setOrderingState}
            style={styles.headerReorderSwitch}
            thumbColor={styles.reorderSwitchThumbColor?.backgroundColor}
            trackColor={{
              true: styles.reorderSwitchTrueTrackColor?.backgroundColor,
              false: styles.reorderSwitchFalseTrackColor?.backgroundColor,
            }}
          />
        </View>
      </View>
      {error && (
        <Text variant="semibold" style={styles.errorText}>
          {t(
            'track-tile.problem-loading-track-it-items',
            'There was a problem loading the Track-It Items',
          )}
        </Text>
      )}
      {hasReorderError && (
        <Text variant="semibold" style={styles.errorText}>
          {t(
            'track-tile.problem-occurred-while-reordering-items',
            'A problem occurred while reordering the items',
          )}
        </Text>
      )}
      {loading && (
        <ActivityIndicator
          testID={tID('tracker-settings-loading')}
          accessibilityRole="progressbar"
          style={styles.loading}
          size="large"
        />
      )}

      <DraggableFlatList
        containerStyle={styles.draggableFlatListContainer}
        data={trackerList}
        keyExtractor={({ id }) => id}
        overScrollMode={isReordering ? 'never' : 'auto'}
        onDragEnd={({ data }) => setOrderState(data)}
        renderItem={useCallback(
          ({ item: tracker, drag, isActive }: RenderItemParams<Tracker>) => {
            const id = tracker.metricId || tracker.id;

            return (
              <ManageTrackerRow
                testID={tID(`tracker-settings-row-${id}`)}
                tracker={tracker}
                isDraggable={isReordering}
                isBeingDragged={isActive}
                endAdornment={
                  reorderSaving && (
                    <ActivityIndicator
                      testID={tID(`tracker-settings-saving-${id}`)}
                      style={styles.trackerRowLoading}
                      size="small"
                    />
                  )
                }
                underlayColor={
                  !reorderSaving
                    ? styles.trackerRowHighlightColor?.backgroundColor
                    : 'rgba(0, 0, 0, 0)'
                }
                onPress={() =>
                  !reorderSaving && !isReordering && onOpenTracker(tracker)
                }
                onPressIn={() => !reorderSaving && isReordering && drag()}
                accessibilityActions={
                  !reorderSaving
                    ? isReordering
                      ? [
                          {
                            name: 'decrement',
                            label: t('track-tile.move-up', 'Move Up'),
                          },
                          {
                            name: 'increment',
                            label: t('track-tile.move-down', 'Move Down'),
                          },
                        ]
                      : [
                          {
                            name: 'activate',
                            label: t(
                              'track-tile.go-to-tracker',
                              'Go to tracker',
                            ),
                          },
                        ]
                    : []
                }
                onAccessibilityAction={(e) => {
                  const action = e.nativeEvent.actionName;
                  switch (action) {
                    case 'activate':
                      !reorderSaving && !isReordering && onOpenTracker(tracker);
                      break;
                    case 'decrement':
                    case 'increment': {
                      const moveDelta = action === 'increment' ? 1 : -1;

                      setOrderState((state) => {
                        if (!state) {
                          return state;
                        }

                        const from = state.indexOf(tracker);
                        const to = from + moveDelta;
                        if (from !== -1 && to > -1 && to < state.length) {
                          [state[to], state[from]] = [state[from], state[to]];
                          return state.slice();
                        }

                        return state;
                      });
                      break;
                    }
                  }
                }}
              />
            );
          },
          [
            styles.trackerRowHighlightColor?.backgroundColor,
            isReordering,
            onOpenTracker,
            reorderSaving,
            styles.trackerRowLoading,
          ],
        )}
      />
    </View>
  );
};

const defaultStyles = createStyles('ManageTrackers', () => ({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  headerContainer: {
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    backgroundColor: '#EEF0F2',
    height: 59,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    color: '#262C32',
    fontSize: 14,
    letterSpacing: 0.23,
  },
  headerReorderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerReorderText: {
    paddingRight: 8,
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
  },
  headerReorderSwitch: {
    transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }],
  },
  trackerRowHighlightColor: { backgroundColor: '#F1F8EA' },
  reorderSwitchThumbColor: { backgroundColor: '#FFFFFF' },
  reorderSwitchTrueTrackColor: { backgroundColor: '#8CC654' },
  reorderSwitchFalseTrackColor: { backgroundColor: '#B2B9C0' },
  errorText: {
    textAlign: 'center',
    padding: 8,
    paddingVertical: 24,
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
  },
  loading: {
    padding: 16,
  },
  trackerRowLoading: {},
  draggableFlatListContainer: { flex: 1 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
