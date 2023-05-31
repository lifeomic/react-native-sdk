import React, { FC } from 'react';
import {
  View,
  TouchableHighlight,
  TouchableHighlightProps,
  I18nManager,
} from 'react-native';
import { t } from '../../../../lib/i18n';
import { Tracker } from '../services/TrackTileService';
import Indicator from '../icons/indicator';
import { Text } from '../styles/Text';
import { tID } from '../common/testID';
import { useIcons, createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

type Props = TouchableHighlightProps & {
  tracker: Tracker;
  isBeingDragged?: boolean;
  isDraggable?: boolean;
  endAdornment?: React.ReactNode;
};

export const ManageTrackerRow: FC<Props> = (props) => {
  const { tracker, endAdornment, ...remainingProps } = props;
  const { isBeingDragged, isDraggable, ...highlightProps } = remainingProps;
  const { styles } = useStyles(defaultStyles);
  const inactive = !tracker.metricId;
  const id = tracker.metricId || tracker.id;
  const { Menu, ChevronRight, ChevronLeft } = useIcons();

  return (
    <TouchableHighlight {...highlightProps}>
      <>
        {isBeingDragged && <View style={styles.divider} />}
        <View
          style={[styles.container, isBeingDragged && styles.containerActive]}
        >
          <View style={[styles.icon, inactive && styles.iconInactive]}>
            <Indicator
              name={id}
              fallbackName={tracker.icon}
              color={tracker.color}
            />
          </View>
          <View style={styles.content}>
            <Text
              variant="semibold"
              testID={tID(`tracker-name-${id}`)}
              style={[styles.nameText, inactive && styles.nameInactiveText]}
            >
              {tracker.name}
            </Text>
            <Text
              variant="semibold"
              testID={tID(`install-status-${id}`)}
              style={[styles.statusText, inactive && styles.statusInactiveText]}
            >
              {inactive
                ? t('track-tile.inactive', 'Inactive')
                : t('track-tile.active', 'Active')}
            </Text>
          </View>
          <View
            style={styles.endAdornmentView}
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
                <Menu stroke={styles.menuImage?.overlayColor} />
              ) : I18nManager.isRTL ? (
                <ChevronLeft stroke={styles.chevronImage?.overlayColor} />
              ) : (
                <ChevronRight stroke={styles.chevronImage?.overlayColor} />
              ))}
          </View>
        </View>
        <View style={styles.divider} />
      </>
    </TouchableHighlight>
  );
};

const defaultStyles = createStyles('ManageTrackersRow', () => ({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 35,
    height: 63,
    alignItems: 'center',
  },
  containerActive: {
    backgroundColor: 'white',
    height: 62,
  },
  icon: {
    opacity: 1,
  },
  iconInactive: {
    opacity: 0.5,
  },
  content: { flex: 1, paddingHorizontal: 18 },
  nameText: {
    color: '#242536',
    fontSize: 16,
    letterSpacing: 0.23,
  },
  nameInactiveText: {
    color: '#7B8996',
  },
  statusText: {
    fontSize: 12,
    letterSpacing: 0.05,
    color: '#6DBA2D',
  },
  statusInactiveText: {
    color: '#7B8996',
  },
  endAdornmentView: {
    marginRight: 7,
    alignItems: 'flex-end',
  },
  menuImage: {
    overlayColor: '#B2B9C0',
  },
  chevronImage: {
    overlayColor: '#B2B9C0',
  },
  divider: {
    height: 1,
    backgroundColor: '#242536',
    opacity: 0.15,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
