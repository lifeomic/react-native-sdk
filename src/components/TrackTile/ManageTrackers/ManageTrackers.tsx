import React, { FC, useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import i18n from '@i18n';
import { useStyleOverrides, StylesProp, NamedStyles, Text } from '../styles';
import { Tracker, isInstalledMetric } from '../services/TrackTileService';
import { useTrackers } from '../hooks/useTrackers';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import DraggableFlatList, {
  RenderItemParams
} from 'react-native-draggable-flatlist';
import { ManageTrackerRow } from './ManageTrackerRow';
import { useSyncTrackerOrder } from './useSyncTrackerOrder';
import { tID } from '../common/testID';
import { SvgProps } from 'react-native-svg';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}
export type ManageTrackersProps = {
  trackerRequestMeta?: ReturnType<typeof useTrackers>;
  onOpenTracker: (metric: Tracker) => void;
  hasReorderError?: boolean;
  icons?: Record<string, React.ComponentType<SvgProps>>;
};

export const ManageTrackers: FC<ManageTrackersProps> = (props) => {
  const { onOpenTracker, trackerRequestMeta = useTrackers(), icons } = props;
  const styles = useStyleOverrides(defaultStyles);
  const [isReordering, setIsReordering] = useState(false);
  const flatStyles = useFlattenedStyles(styles, [
    'manageTrackersTrackerRowHighlightColor',
    'manageTrackersReorderSwitchThumbColor',
    'manageTrackersReorderSwitchTrueTrackColor',
    'manageTrackersReorderSwitchFalseTrackColor'
  ]);

  const { loading, trackers, error } = trackerRequestMeta;

  const [orderState, setOrderState] = useState<Tracker[] | undefined>();

  const {
    syncTrackerOrder,
    loading: reorderSaving,
    hasError: hasReorderError = props.hasReorderError
  } = useSyncTrackerOrder(orderState);

  const setOrderingState = useCallback(
    async (reordering: boolean) => {
      setIsReordering(reordering);

      if (reordering) {
        setOrderState(() => trackers?.filter(isInstalledMetric));
      } else {
        await syncTrackerOrder();
        setOrderState((ts) =>
          ts?.concat(trackers.filter((t) => !isInstalledMetric(t)))
        );
      }
    },
    [trackers, syncTrackerOrder]
  );

  const trackerList = orderState ?? trackers;

  return (
    <View style={styles.manageTrackersContainer}>
      <View style={styles.manageTrackersHeader}>
        <Text variant="semibold" style={styles.manageTrackersHeaderTitle}>
          {i18n.t('5cd43bf61db56cfc95edce3650ce607e', {
            defaultValue: 'Your active items',
            ns: 'track-tile-ui'
          })}
        </Text>
        <View style={styles.manageTrackersHeaderReorderContainer}>
          <Text
            accessible={false}
            variant="semibold"
            style={styles.manageTrackersHeaderReorderText}
          >
            {i18n.t('332c80b1838dc515f5031e09da3b7f3f', {
              defaultValue: 'Reorder',
              ns: 'track-tile-ui'
            })}
          </Text>
          <Switch
            testID={tID('reorder-trackers-switch')}
            accessibilityLabel={
              isReordering
                ? i18n.t('661088055b4239afd979921576bc7a1d', {
                    defaultValue: 'Save tracker order',
                    ns: 'track-tile-ui'
                  })
                : i18n.t('e46aea268279b8b71f527d3fedca48e6', {
                    defaultValue: 'Reorder trackers',
                    ns: 'track-tile-ui'
                  })
            }
            value={isReordering}
            onValueChange={setOrderingState}
            style={styles.manageTrackersHeaderReorderSwitch}
            thumbColor={flatStyles.manageTrackersReorderSwitchThumbColor.color}
            trackColor={{
              true: flatStyles.manageTrackersReorderSwitchTrueTrackColor.color,
              false: flatStyles.manageTrackersReorderSwitchFalseTrackColor.color
            }}
          />
        </View>
      </View>
      {error && (
        <Text variant="semibold" style={styles.manageTrackersError}>
          {i18n.t('b22f9f10b629d85aef19e294f78a0562', {
            defaultValue: 'There was a problem loading the Track-It Items',
            ns: 'track-tile-ui'
          })}
        </Text>
      )}
      {hasReorderError && (
        <Text variant="semibold" style={styles.manageTrackersError}>
          {i18n.t('561b721162a7e1e9985e92d5c33ceb34', {
            defaultValue: 'A problem occurred while reordering the items',
            ns: 'track-tile-ui'
          })}
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
                icons={icons}
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
                            label: i18n.t('3717ca1e1702edabf06c7cf830e70627', {
                              defaultValue: 'Move Up',
                              ns: 'track-tile-ui'
                            })
                          },
                          {
                            name: 'increment',
                            label: i18n.t('aa8ea843721d50172c76e0c87b43698e', {
                              defaultValue: 'Move Down',
                              ns: 'track-tile-ui'
                            })
                          }
                        ]
                      : [
                          {
                            name: 'activate',
                            label: i18n.t('06799e531485986e06f0cad05252907d', {
                              defaultValue: 'Go to tracker',
                              ns: 'track-tile-ui'
                            })
                          }
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
                        if (!state) return state;

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
          [isReordering, reorderSaving]
        )}
      />
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  manageTrackersContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  manageTrackersHeader: {
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    backgroundColor: '#EEF0F2',
    height: 59,
    alignItems: 'center',
    flexDirection: 'row'
  },
  manageTrackersHeaderTitle: {
    color: '#262C32',
    fontSize: 14,
    letterSpacing: 0.23
  },
  manageTrackersHeaderReorderContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  manageTrackersHeaderReorderText: {
    paddingRight: 8,
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23
  },
  manageTrackersHeaderReorderSwitch: {
    transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }]
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
    letterSpacing: 0.23
  },
  manageTrackersLoading: {
    padding: 16
  },
  trackerRowLoading: {},
  draggableFlatListContainer: { flex: 1 }
});
