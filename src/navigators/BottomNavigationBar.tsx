import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../hooks/useTheme';
import { BottomNavigation, shadow } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks';
import { ViewStyle } from 'react-native';

export const BottomNavigationBar = ({
  navigation,
  state,
  descriptors,
  insets,
}: BottomTabBarProps) => {
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();

  return (
    <BottomNavigation.Bar
      labeled
      shifting={true}
      activeColor={theme.colors.onSurface}
      inactiveColor={theme.colors.onSurfaceDisabled}
      navigationState={state}
      safeAreaInsets={insets}
      style={styles.barStyle}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
          navigation.dispatch({
            ...CommonActions.navigate(route),
            target: state.key,
          });
        }
      }}
      renderIcon={({ route, focused, color }) => {
        const { options } = descriptors[route.key];
        if (options.tabBarIcon) {
          return options.tabBarIcon({ focused, color, size: 24 });
        }

        return null;
      }}
      getLabelText={({ route }) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        return label;
      }}
    />
  );
};

const defaultStyles = createStyles('TabNavigator', (theme) => ({
  barStyle: {
    backgroundColor: theme.colors.background,
    zIndex: 1,
    ...shadow(4),
  } as ViewStyle,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TabNavigatorStyles = NamedStylesProp<typeof defaultStyles>;
