import React, { ReactNode } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedbackProps,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from 'i18next';
import { createStyles } from '../components/BrandConfigProvider';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useStyles } from '../hooks/useStyles';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { useTheme } from '../hooks/useTheme';
import { LabelPosition } from '@react-navigation/bottom-tabs/lib/typescript/src/types';

const defaultBottomInset = 12;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const routes = state.routes;
  const activeRouteIndex = state.index;
  const inset = useSafeAreaInsets();
  const width = Dimensions.get('window').width / routes.length;
  const { styles } = useStyles(defaultStyles);
  const { componentProps } = useDeveloperConfig();
  const { tabs, showLabels } = componentProps?.TabBar || {};
  const theme = useTheme();

  const bottomInset = inset.bottom || defaultBottomInset;

  const activeIndicators = [
    styles.activeIndicator0,
    styles.activeIndicator1,
    styles.activeIndicator2,
  ];

  const indicatorStyle = [
    { left: activeRouteIndex * width, width },
    styles.activeIndicator,
    activeIndicators[activeRouteIndex],
  ];

  return (
    <View style={[styles.view, { height: 60 + bottomInset }]}>
      <View style={indicatorStyle} />
      <View style={styles.barButtonContainer}>
        {routes.map((route, routeIndex) => {
          const Icon = tabs?.[routeIndex].icon;
          const isActive = routeIndex === activeRouteIndex;
          const svgProps = tabs?.[routeIndex].svgProps?.(theme);
          const altSvgProps = isActive
            ? tabs?.[routeIndex].svgPropsActive?.(theme)
            : tabs?.[routeIndex].svgPropsInactive?.(theme);
          const options = descriptors[route.key].options;

          const navigateToTab = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate({
                name: route.name,
                merge: true,
                params: undefined,
              });
            }
          };

          return (
            <TabBarButton
              key={route.key}
              width={width}
              isActive={isActive}
              activeRouteIndex={activeRouteIndex}
              // @ts-ignore
              icon={<Icon {...svgProps} {...altSvgProps} />}
              label={options.tabBarLabel}
              accessibilityLabel={t(
                '{routeName}, tab, {tabCount} of {totalTabCount}',
                {
                  routeName: route.name,
                  tabCount: routeIndex + 1,
                  totalTabCount: routes.length,
                },
              )}
              onPress={navigateToTab}
              onLongPress={navigateToTab}
              showLabel={showLabels}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabBarButtonProps
  extends Pick<
    TouchableWithoutFeedbackProps,
    | 'onPress'
    | 'onLongPress'
    | 'testID'
    | 'accessibilityLabel'
    | 'accessibilityRole'
    | 'accessibilityState'
  > {
  label?:
    | string
    | ((props: {
        focused: boolean;
        color: string;
        position: LabelPosition;
        children: string;
      }) => ReactNode);
  width: number;
  isActive: boolean;
  activeRouteIndex: number;
  icon: JSX.Element | undefined;
  showLabel?: boolean;
}

const TabBarButton = ({
  label,
  width,
  isActive,
  activeRouteIndex,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  icon,
}: TabBarButtonProps) => {
  const inset = useSafeAreaInsets();
  const { styles } = useStyles(defaultStyles);

  const bottomInset = inset.bottom || defaultBottomInset;

  const tabViewStylesActive = [
    styles.tabViewActive0,
    styles.tabViewActive1,
    styles.tabViewActive2,
  ];

  const tabViewStylesInactive = [
    styles.tabViewInactive0,
    styles.tabViewInactive1,
    styles.tabViewInactive2,
  ];

  const labelTextStylesActive = [
    styles.labelActiveText0,
    styles.labelActiveText1,
    styles.labelActiveText2,
  ];

  const labelTextStylesInactive = [
    styles.labelInactiveText0,
    styles.labelInactiveText1,
    styles.labelInactiveText2,
  ];

  const tabViewStyle = [
    isActive
      ? [styles.tabViewActive, tabViewStylesActive[activeRouteIndex]]
      : [styles.tabViewInactive, tabViewStylesInactive[activeRouteIndex]],
    { width, paddingBottom: bottomInset },
  ];

  const labelTextStyle = isActive
    ? [styles.labelActiveText, labelTextStylesActive[activeRouteIndex]]
    : [styles.labelInactiveText, labelTextStylesInactive[activeRouteIndex]];

  const hitSlop = {
    left: 15,
    right: 15,
    top: 0,
    bottom: 5,
  };

  return (
    <View style={tabViewStyle}>
      <TouchableWithoutFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        hitSlop={hitSlop}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        accessible={false}
      >
        <View style={styles.iconLabelView}>
          <View style={styles.iconView}>{icon}</View>
          <LabelText style={labelTextStyle} label={label} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

interface LabelTextProps {
  style?: StyleProp<TextStyle>;
  label?:
    | string
    | ((props: {
        focused: boolean;
        color: string;
        position: LabelPosition;
        children: string;
      }) => ReactNode);
}

const LabelText = ({ style, label }: LabelTextProps) => {
  const { componentProps } = useDeveloperConfig();
  const { showLabels } = componentProps?.TabBar || {};

  if (!showLabels) {
    return null;
  }

  return typeof label === 'string' ? (
    <Text style={style} numberOfLines={1}>
      {label}
    </Text>
  ) : null;
};

const defaultStyles = createStyles('TabBar', (theme) => ({
  view: {
    backgroundColor: theme.colors.background,
    width: '100%',
    borderTopColor: theme.colors.onBackground,
    borderTopWidth: 1,
  },
  iconLabelView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  barButtonContainer: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  iconView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  labelActiveText: {
    alignSelf: 'center',
  },
  labelActiveText0: {},
  labelActiveText1: {},
  labelActiveText2: {},
  labelInactiveText: {
    alignSelf: 'center',
  },
  labelInactiveText0: {},
  labelInactiveText1: {},
  labelInactiveText2: {},
  activeIndicator: {
    position: 'absolute',
    top: -6,
    height: 2 * 3,
    zIndex: 1,
  },
  activeIndicator0: {
    backgroundColor: theme.colors.primary,
  },
  activeIndicator1: {
    backgroundColor: theme.colors.secondary,
  },
  activeIndicator2: {
    backgroundColor: theme.colors.tertiary,
  },
  tabViewActive: {
    height: '100%',
    paddingTop: 2,
  },
  tabViewActive0: {
    backgroundColor: theme.colors.primaryContainer,
  },
  tabViewActive1: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  tabViewActive2: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  tabViewInactive: {
    height: '100%',
    paddingTop: 2,
  },
  tabViewInactive0: {
    backgroundColor: theme.colors.surface,
  },
  tabViewInactive1: {
    backgroundColor: theme.colors.surface,
  },
  tabViewInactive2: {
    backgroundColor: theme.colors.surface,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TabBarStyles = NamedStylesProp<typeof defaultStyles>;
