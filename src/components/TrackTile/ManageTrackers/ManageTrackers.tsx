import React, { FC, useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { t } from '../../../../lib/i18n';
import { useStyleOverrides, StylesProp, NamedStyles, Text } from '../styles';
import { Tracker, isInstalledMetric } from '../services/TrackTileService';
import { useTrackers } from '../hooks/useTrackers';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { ManageTrackerRow } from './ManageTrackerRow';
import { useSyncTrackerOrder } from './useSyncTrackerOrder';
import { tID } from '../common/testID';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}
export type ManageTrackersProps = {
  trackerRequestMeta?: ReturnType<typeof useTrackers>;
  onOpenTracker: (metric: Tracker) => void;
  hasReorderError?: boolean;
};

export const ManageTrackers: FC<ManageTrackersProps> = (props) => {
  const trackerRequestMetaHook = useTrackers();
  const { onOpenTracker, trackerRequestMeta } = props;
  const styles = useStyleOverrides(defaultStyles);
  const [isReordering, setIsReordering] = useState(false);
  const flatStyles = useFlattenedStyles(styles, [
    'manageTrackersTrackerRowHighlightColor',
    'manageTrackersReorderSwitchThumbColor',
    'manageTrackersReorderSwitchTrueTrackColor',
    'manageTrackersReorderSwitchFalseTrackColor',
  ]);

  const { loading, trackers, error } =
    trackerRequestMeta ?? trackerRequestMetaHook;

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
    <View style={styles.manageTrackersContainer}>
      <View style={styles.manageTrackersHeader}>
        <Text variant="semibold" style={styles.manageTrackersHeaderTitle}>
          {t('track-tile.your-active-items', 'Your active items')}
        </Text>
        <View style={styles.manageTrackersHeaderReorderContainer}>
          <Text
            accessible={false}
            variant="semibold"
            style={styles.manageTrackersHeaderReorderText}
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
            style={styles.manageTrackersHeaderReorderSwitch}
            thumbColor={flatStyles.manageTrackersReorderSwitchThumbColor.color}
            trackColor={{
              true: flatStyles.manageTrackersReorderSwitchTrueTrackColor.color,
              false:
                flatStyles.manageTrackersReorderSwitchFalseTrackColor.color,
            }}
          />
        </View>
      </View>
      {error && (
        <Text variant="semibold" style={styles.manageTrackersError}>
          {t(
            'track-tile.problem-loading-track-it-items',
            'There was a problem loading the Track-It Items',
          )}
        </Text>
      )}
      {hasReorderError && (
        <Text variant="semibold" style={styles.manageTrackersError}>
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
          style={styles.manageTrackersLoading}
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
                    ? flatStyles.manageTrackersTrackerRowHighlightColor.color
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
            flatStyles.manageTrackersTrackerRowHighlightColor.color,
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

const defaultStyles = StyleSheet.create({
  manageTrackersContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  manageTrackersHeader: {
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    backgroundColor: '#EEF0F2',
    height: 59,
    alignItems: 'center',
    flexDirection: 'row',
  },
  manageTrackersHeaderTitle: {
    color: '#262C32',
    fontSize: 14,
    letterSpacing: 0.23,
  },
  manageTrackersHeaderReorderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageTrackersHeaderReorderText: {
    paddingRight: 8,
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
  },
  manageTrackersHeaderReorderSwitch: {
    transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }],
  },
  manageTrackersTrackerRowHighlightColor: { color: '#F1F8EA' },
  manageTrackersReorderSwitchThumbColor: { color: '#FFFFFF' },
  manageTrackersReorderSwitchTrueTrackColor: { color: '#8CC654' },
  manageTrackersReorderSwitchFalseTrackColor: { color: '#B2B9C0' },
  manageTrackersError: {
    textAlign: 'center',
    padding: 8,
    paddingVertical: 24,
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
  },
  manageTrackersLoading: {
    padding: 16,
  },
  trackerRowLoading: {},
  draggableFlatListContainer: { flex: 1 },
});
