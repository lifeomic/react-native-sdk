import React, { FC } from 'react';
import {
  View,
  TouchableHighlight,
  TouchableHighlightProps,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { t } from 'i18next';
import { Tracker } from '../services/TrackTileService';
import Indicator from '../icons/indicator';
import Chevron from '../icons/Chevron';
import { StylesProp, useStyleOverrides } from '../styles';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import Menu from '../icons/Menu';
import { Text } from '../styles/Text';
import { tID } from '../common/testID';
import { SvgProps } from 'react-native-svg';

type Props = TouchableHighlightProps & {
  tracker: Tracker;
  isBeingDragged?: boolean;
  isDraggable?: boolean;
  endAdornment?: React.ReactNode;
  icons?: Record<string, React.ComponentType<SvgProps>>;
};

export const ManageTrackerRow: FC<Props> = (props) => {
  const { tracker, endAdornment, icons, ...remainingProps } = props;
  const { isBeingDragged, isDraggable, ...highlightProps } = remainingProps;
  const styles = useStyleOverrides(defaultStyles);
  const flatStyles = useFlattenedStyles(styles, [
    'manageTrackerRowChevronColor',
  ]);
  const inactive = !tracker.metricId;
  const id = tracker.metricId || tracker.id;

  return (
    <TouchableHighlight {...highlightProps}>
      <>
        {isBeingDragged && <View style={styles.manageTrackerRowDivider} />}
        <View
          style={[
            styles.manageTrackerRowContainer,
            isBeingDragged && styles.manageTrackerRowContainerActive,
          ]}
        >
          <View
            style={[
              styles.manageTrackerRowIcon,
              inactive && styles.manageTrackerRowIconInactive,
            ]}
          >
            <Indicator
              CustomIcon={icons?.[id]}
              name={tracker.icon}
              color={tracker.color}
            />
          </View>
          <View style={styles.manageTrackerRowContent}>
            <Text
              variant="semibold"
              testID={tID(`tracker-name-${id}`)}
              style={[
                styles.manageTrackerRowTrackerName,
                inactive && styles.manageTrackerRowTrackerNameInactive,
              ]}
            >
              {tracker.name}
            </Text>
            <Text
              variant="semibold"
              testID={tID(`install-status-${id}`)}
              style={[
                styles.manageTrackerRowTrackerStatus,
                inactive && styles.manageTrackerRowTrackerStatusInactive,
              ]}
            >
              {inactive
                ? t('track-tile.inactive', 'Inactive')
                : t('track-tile.active', 'Active')}
            </Text>
          </View>
          <View
            style={styles.manageTrackerRowEndAdornment}
            testID={tID(
              isDraggable ? `reorder-tracker-${id}` : `go-to-tracker-${id}`,
            )}
            accessible={false}
            accessibilityLabel={
              isDraggable
                ? t('track-tile.hold-drag-to-change-order-of', {
                    defaultValue:
                      'Hold and Drag to Change the Order of {{name}}',
                    name: tracker.name,
                  })
                : undefined
            }
          >
            {endAdornment ||
              (isDraggable ? (
                <Menu />
              ) : (
                <Chevron
                  direction={I18nManager.isRTL ? 'left' : 'right'}
                  fill={flatStyles.manageTrackerRowChevronColor.color}
                />
              ))}
          </View>
        </View>
        <View style={styles.manageTrackerRowDivider} />
      </>
    </TouchableHighlight>
  );
};

declare module './ManageTrackers' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  manageTrackerRowContainer: {
    flexDirection: 'row',
    paddingHorizontal: 35,
    height: 63,
    alignItems: 'center',
  },
  manageTrackerRowContainerActive: {
    backgroundColor: 'white',
    height: 62,
  },
  manageTrackerRowIcon: {
    opacity: 1,
  },
  manageTrackerRowIconInactive: {
    opacity: 0.5,
  },
  manageTrackerRowContent: { flex: 1, paddingHorizontal: 18 },
  manageTrackerRowTrackerName: {
    color: '#242536',
    fontSize: 16,
    letterSpacing: 0.23,
  },
  manageTrackerRowTrackerNameInactive: {
    color: '#7B8996',
  },
  manageTrackerRowTrackerStatus: {
    fontSize: 12,
    letterSpacing: 0.05,
    color: '#6DBA2D',
  },
  manageTrackerRowTrackerStatusInactive: {
    color: '#7B8996',
  },
  manageTrackerRowEndAdornment: {
    height: 12,
    width: 30,
    marginRight: 7,
    alignItems: 'flex-end',
  },
  manageTrackerRowChevronColor: {
    color: '#B2B9C0',
  },
  manageTrackerRowDivider: {
    height: 1,
    backgroundColor: '#242536',
    opacity: 0.15,
  },
});
