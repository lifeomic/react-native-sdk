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
    styles.activeIndicator0View,
    styles.activeIndicator1View,
    styles.activeIndicator2View,
  ];

  const indicatorStyle = [
    { left: activeRouteIndex * width, width },
    styles.activeIndicatorView,
    activeIndicators[activeRouteIndex],
  ];

  return (
    <View style={[styles.view, { height: 60 + bottomInset }]}>
      <View style={indicatorStyle} />
      <View style={styles.barButtonContainer}>
        {routes.map((route, routeIndex) => {
          const tab = tabs?.[routeIndex];
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
                params: tab?.initialParams,
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

  // Since we've only defined styles for the first 3 tabs
  // any additional tabs will use the styles of the last tab
  const limitedRouteIndex = Math.min(activeRouteIndex, 2);

  const tabViewStylesActive = [
    styles.tabActive0View,
    styles.tabActive1View,
    styles.tabActive2View,
  ];

  const tabViewStylesInactive = [
    styles.tabInactive0View,
    styles.tabInactive1View,
    styles.tabInactive2View,
  ];

  const labelTextStylesActive = [
    styles.labelActiveText0,
    styles.labelActiveText1,
    styles.labelActiveText2,
  ];

  const labelTextStylesInactive = [
    styles.labelInactive0Text,
    styles.labelInactive1Text,
    styles.labelInactive2Text,
  ];

  const tabViewStyle = [
    isActive
      ? [styles.tabActiveView, tabViewStylesActive[limitedRouteIndex]]
      : [styles.tabInactiveView, tabViewStylesInactive[limitedRouteIndex]],
    { width, paddingBottom: bottomInset },
  ];

  const labelTextStyle = isActive
    ? [styles.labelActiveText, labelTextStylesActive[limitedRouteIndex]]
    : [styles.labelInactiveText, labelTextStylesInactive[limitedRouteIndex]];

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
  labelInactive0Text: {},
  labelInactive1Text: {},
  labelInactive2Text: {},
  activeIndicatorView: {
    position: 'absolute',
    top: -6,
    height: 2 * 3,
    zIndex: 1,
  },
  activeIndicator0View: {
    backgroundColor: theme.colors.primary,
  },
  activeIndicator1View: {
    backgroundColor: theme.colors.secondary,
  },
  activeIndicator2View: {
    backgroundColor: theme.colors.tertiary,
  },
  tabActiveView: {
    height: '100%',
    paddingTop: 2,
  },
  tabActive0View: {
    backgroundColor: theme.colors.primaryContainer,
  },
  tabActive1View: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  tabActive2View: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  tabInactiveView: {
    height: '100%',
    paddingTop: 2,
  },
  tabInactive0View: {
    backgroundColor: theme.colors.surface,
  },
  tabInactive1View: {
    backgroundColor: theme.colors.surface,
  },
  tabInactive2View: {
    backgroundColor: theme.colors.surface,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TabBarStyles = NamedStylesProp<typeof defaultStyles>;
