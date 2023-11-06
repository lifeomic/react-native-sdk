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
import { SvgProps } from 'react-native-svg';
import { t } from 'i18next';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useStyles } from '../hooks/useStyles';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { LabelPosition } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { useTabsConfig } from '../hooks/useTabsConfig';
import { getDefaultTabs } from './getDefaultTabs';
import { NavigationTab } from '../common';
import { TabStyle } from '../hooks';

const defaultBottomInset = 12;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const routes = state.routes;
  const activeRouteIndex = state.index;
  const inset = useSafeAreaInsets();
  const width = Dimensions.get('window').width / routes.length;
  const { styles } = useStyles(defaultStyles);
  const { componentProps } = useDeveloperConfig();
  const icons = useIcons();
  const tabConfig = useTabsConfig(getDefaultTabs(icons));
  const { tabs = tabConfig.tabs, showLabels } = componentProps?.TabBar || {};

  const bottomInset = inset.bottom || defaultBottomInset;

  const indicatorStyle = [
    { left: activeRouteIndex * width, width },
    styles.activeIndicatorView,
    tabConfig.styles?.activeIndicatorView,
    tabs[activeRouteIndex]?.styles?.activeIndicatorView,
  ];

  return (
    <View style={[styles.view, { height: 60 + bottomInset }]}>
      <View style={indicatorStyle} />
      <View style={styles.barButtonContainer}>
        {routes.map((route, routeIndex) => {
          const tab = tabs?.[routeIndex];
          const Icon = tab.icon;
          const isActive = routeIndex === activeRouteIndex;
          const svgProps = {
            ...styles.svgProps,
            ...tabConfig?.styles?.svgProps,
            ...tab?.styles?.svgProps,
          };
          const altSvgProps = isActive
            ? {
                ...styles.svgPropsActive,
                ...tabConfig?.styles?.svgPropsActive,
                ...tab?.styles?.svgPropsActive,
              }
            : {
                ...styles.svgPropsInactive,
                ...tabConfig?.styles?.svgPropsInactive,
                ...tab?.styles?.svgPropsInactive,
              };
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
              tab={tab}
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
  icon: JSX.Element | undefined;
  showLabel?: boolean;
  tab?: NavigationTab;
  tabStyles?: TabStyle;
}

const TabBarButton = ({
  label,
  width,
  isActive,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  icon,
  tab,
  tabStyles,
}: TabBarButtonProps) => {
  const inset = useSafeAreaInsets();
  const { styles } = useStyles(defaultStyles);

  const bottomInset = inset.bottom || defaultBottomInset;

  const tabViewStyle = [
    { width, paddingBottom: bottomInset },
    isActive
      ? [
          styles.tabActiveView,
          tabStyles?.tabActiveView,
          tab?.styles?.tabActiveView,
        ]
      : [
          styles.tabInactiveView,
          tabStyles?.tabInactiveView,
          tab?.styles?.tabInactiveView,
        ],
  ];

  const labelTextStyle = isActive
    ? [
        styles.labelActiveText,
        tabStyles?.labelActiveText,
        tab?.styles?.labelActiveText,
      ]
    : [
        styles.labelInactiveText,
        tabStyles?.labelInactiveText,
        tab?.styles?.labelInactiveText,
      ];

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
    color: theme.colors.onSurface,
  },
  labelInactiveText: {
    alignSelf: 'center',
    color: theme.colors.onSurfaceDisabled,
  },
  activeIndicatorView: {
    position: 'absolute',
    height: 2 * 3,
    zIndex: 1,
    backgroundColor: theme.colors.scrim,
  },
  tabActiveView: {
    height: '100%',
    paddingTop: 2,
    backgroundColor: theme.colors.background,
  },
  tabInactiveView: {
    height: '100%',
    paddingTop: 2,
    backgroundColor: theme.colors.background,
  },
  svgProps: {} as SvgProps,
  svgPropsActive: {
    color: theme.colors.onSurface,
  } as SvgProps,
  svgPropsInactive: {
    color: theme.colors.onSurfaceDisabled,
  } as SvgProps,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TabBarStyles = NamedStylesProp<typeof defaultStyles>;
