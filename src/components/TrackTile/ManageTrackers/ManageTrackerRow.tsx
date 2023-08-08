import React, { FC, useEffect, useRef } from 'react';
import {
  View,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableWithoutFeedback,
  I18nManager,
  Animated,
} from 'react-native';
import { t } from '../../../../lib/i18n';
import { Tracker } from '../services/TrackTileService';
import Indicator from '../icons/indicator';
import { Text } from '../styles/Text';
import { tID } from '../common/testID';
import { useIcons, createStyles } from '../../BrandConfigProvider';
import { useStyles, useTheme } from '../../../hooks';
import { IconButton } from 'react-native-paper';

type Props = Omit<TouchableHighlightProps, 'onPress' | 'onPressIn'> & {
  tracker: Tracker;
  isBeingDragged?: boolean;
  isEditable?: boolean;
  endAdornment?: React.ReactNode;
  onToggleInstall?: () => void;
  onDrag?: () => void;
  onOpen?: () => void;
};

export const ManageTrackerRow: FC<Props> = (props) => {
  const { tracker, endAdornment, onToggleInstall, ...remainingProps } = props;
  const { isBeingDragged, isEditable, onDrag, onOpen, ...highlightProps } =
    remainingProps;
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const id = tracker.metricId || tracker.id;
  const { Menu, ChevronRight, ChevronLeft, Circle, CheckCircle } = useIcons();
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: !isEditable ? 0 : 1,
      duration: isEditable ? 400 : 500,
      useNativeDriver: false,
    }).start();
  }, [isEditable]);

  return (
    <TouchableHighlight
      onPress={isEditable ? undefined : onOpen}
      {...highlightProps}
    >
      <>
        {isBeingDragged && <View style={styles.divider} />}
        <View
          style={[styles.container, isBeingDragged && styles.containerActive]}
        >
          <Animated.View
            style={[
              styles.startAdornmentView,
              {
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-65, 0],
                    }),
                  },
                ],
                width: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 24],
                }),
              },
            ]}
            testID={tID(`toggle-button-${id}`)}
          >
            <IconButton
              onPress={onToggleInstall}
              icon={() =>
                tracker.installed ? (
                  <CheckCircle stroke={theme.colors.primary} />
                ) : (
                  <Circle stroke={theme.colors.primary} />
                )
              }
            />
          </Animated.View>
          <View
            style={[styles.icon, !tracker.installed && styles.iconInactive]}
          >
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
              style={[
                styles.nameText,
                !tracker.installed && styles.nameInactiveText,
              ]}
            >
              {tracker.name}
            </Text>
            <Text
              variant="semibold"
              testID={tID(`install-status-${id}`)}
              style={[
                styles.statusText,
                !tracker.installed && styles.statusInactiveText,
              ]}
            >
              {!tracker.installed
                ? t('track-tile.inactive', 'Inactive')
                : t('track-tile.active', 'Active')}
            </Text>
          </View>
          <View
            style={styles.endAdornmentView}
            testID={tID(
              isEditable ? `reorder-tracker-${id}` : `go-to-tracker-${id}`,
            )}
            accessible={false}
            accessibilityLabel={
              isEditable
                ? t('track-tile.hold-drag-to-change-order-of', {
                    defaultValue:
                      'Hold and Drag to Change the Order of {{name}}',
                    name: tracker.name,
                  })
                : undefined
            }
          >
            <Animated.View
              style={{
                opacity: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              }}
            >
              {endAdornment ||
                (I18nManager.isRTL ? (
                  <ChevronLeft stroke={styles.chevronImage?.overlayColor} />
                ) : (
                  <ChevronRight stroke={styles.chevronImage?.overlayColor} />
                ))}
            </Animated.View>

            <TouchableWithoutFeedback
              onPressIn={isEditable ? onDrag : undefined}
              testID={tID(`drag-handle-${id}`)}
            >
              <Animated.View
                style={[
                  styles.menuImageContainer,
                  {
                    transform: [
                      {
                        translateX: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [75, 0],
                        }),
                      },
                    ],
                    width: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 20],
                    }),
                  },
                ]}
              >
                <Menu stroke={styles.menuImage?.overlayColor} />
              </Animated.View>
            </TouchableWithoutFeedback>
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
    paddingHorizontal: 24,
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
  startAdornmentView: {
    marginRight: 16,
    alignItems: 'center',
  },
  endAdornmentView: {
    marginLeft: 7,
    alignItems: 'center',
    position: 'relative',
  },
  menuImageContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.01)', // need this to make the menu grab-able
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
