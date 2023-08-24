import React, { FC, useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { t } from '../../../../lib/i18n';
import { Text } from '../styles';
import { Tracker } from '../services/TrackTileService';
import { useTrackers } from '../hooks/useTrackers';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { ManageTrackerRow } from './ManageTrackerRow';
import { useSyncTrackerOrder } from './useSyncTrackerOrder';
import { tID } from '../common/testID';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import isEqual from 'lodash/isEqual';
import { usePrevious } from '../hooks/usePrevious';

export type EditingState = 'editing' | 'done' | undefined;

export type ManageTrackersProps = {
  trackerRequestMeta?: ReturnType<typeof useTrackers>;
  onOpenTracker: (metric: Tracker) => void;
  hasReorderError?: boolean;
  editingState?: EditingState;
};

export const ManageTrackers: FC<ManageTrackersProps> = (props) => {
  const { onOpenTracker, trackerRequestMeta, editingState } = props;
  const { styles } = useStyles(defaultStyles);

  const isEditing = editingState === 'editing';
  const { loading, trackers, error } = useTrackers(trackerRequestMeta);
  const [initialState, setInitialState] = useState<Tracker[] | undefined>();
  const [orderState, setOrderState] = useState<Tracker[] | undefined>();
  const previousEditingState = usePrevious(editingState);

  const {
    syncTrackerOrder,
    loading: reorderSaving,
    hasError: hasReorderError = props.hasReorderError,
  } = useSyncTrackerOrder(orderState);

  const setOrderingState = useCallback(
    async (reordering: boolean) => {
      if (!trackers) {
        return;
      }

      if (reordering) {
        const data = trackers.map((d) => ({
          ...d,
          installed: d.installed ?? false,
        }));
        setInitialState(data.slice());
        setOrderState(data.slice());
      } else if (!isEqual(initialState, orderState)) {
        await syncTrackerOrder();
      }
    },
    [trackers, syncTrackerOrder, initialState, orderState],
  );

  useEffect(() => {
    if (previousEditingState !== editingState) {
      if (editingState === 'editing') {
        setOrderingState(true);
      } else if (editingState === 'done') {
        setOrderingState(false);
      } else {
        setOrderState(undefined);
      }
    }
  }, [editingState, previousEditingState, setOrderingState]);

  const trackerList = orderState ?? trackers;

  return (
    <View style={styles.container}>
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
        style={styles.draggableFlatListContainer}
        data={trackerList}
        keyExtractor={({ id }) => id}
        overScrollMode={isEditing ? 'never' : 'auto'}
        onDragEnd={({ data }) => setOrderState(data)}
        renderItem={useCallback(
          ({ item: tracker, drag, isActive }: RenderItemParams<Tracker>) => {
            const id = tracker.metricId || tracker.id;

            return (
              <ManageTrackerRow
                testID={tID(`tracker-settings-row-${id}`)}
                tracker={tracker}
                isEditable={isEditing}
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
                onOpen={() =>
                  !reorderSaving && !isEditing && onOpenTracker(tracker)
                }
                onDrag={() => !reorderSaving && isEditing && drag()}
                onToggleInstall={() => {
                  setOrderState((current) =>
                    current?.map((trackerData) => ({
                      ...trackerData,
                      installed:
                        trackerData === tracker
                          ? !trackerData.installed
                          : trackerData.installed,
                    })),
                  );
                }}
                accessibilityActions={
                  !reorderSaving
                    ? isEditing
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
                      !reorderSaving && !isEditing && onOpenTracker(tracker);
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
            isEditing,
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
  draggableFlatListContainer: {
    minHeight: '100%',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
