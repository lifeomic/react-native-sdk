import React, { useCallback, useEffect } from 'react';

import { Appbar, Text } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { createStyles, useIcons } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import {
  BackHandler,
  Platform,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useDeveloperConfig, useTheme } from '../hooks';
import { RouteColor } from '../common/DeveloperConfig';

export function AppNavHeader({
  back,
  options,
  route,
  navigation,
}: NativeStackHeaderProps) {
  const { styles } = useStyles(defaultStyles);
  const { ChevronLeft } = useIcons();
  const { headerTitle } = options;
  const { headerString, headerFunction } =
    typeof headerTitle === 'string'
      ? { headerString: headerTitle, headerFunction: undefined }
      : typeof headerTitle === 'function'
      ? { headerFunction: headerTitle, headerString: undefined }
      : { headerFunction: undefined, headerString: undefined };

  const title = options.title || headerString || route.name;
  const config = useDeveloperConfig();
  const headerStyles = useColorMapping(
    'backgroundColor',
    config.AppNavHeader?.headerColors,
    route,
    styles.view,
  );
  const titleStyles = useColorMapping(
    'color',
    config.AppNavHeader?.onHeaderColors,
    route,
    styles.titleText,
  );
  const statusBarHeight = config.AppNavHeader?.statusBarHeight;

  const backNavigationHandler = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }

    return false;
  }, [navigation]);

  useEffect(() => {
    const handler = BackHandler.addEventListener(
      'hardwareBackPress',
      backNavigationHandler,
    );
    return () => handler.remove();
  }, [backNavigationHandler]);

  if (options.headerShown === false) {
    return null;
  }

  return (
    <Appbar.Header statusBarHeight={statusBarHeight} style={headerStyles}>
      {back ? (
        <Appbar.Action
          icon={ChevronLeft}
          color={styles.backActionIcon?.color}
          onPress={backNavigationHandler}
          style={styles.backAction}
        />
      ) : null}
      {options.headerLeft && (
        <View>
          {options?.headerLeft?.({
            tintColor: options.headerTintColor,
            canGoBack: !!back,
          })}
        </View>
      )}
      <Appbar.Content
        title={
          headerFunction ? (
            headerFunction({
              children: title,
              tintColor: options.headerTintColor,
            })
          ) : (
            <Title text={title} style={titleStyles} />
          )
        }
        style={[styles.contentView, back && styles.contentViewWithBackButton]}
      />
      {options.headerRight && (
        <View>
          {options?.headerRight?.({
            tintColor: options.headerTintColor,
            canGoBack: !!back,
          })}
        </View>
      )}
    </Appbar.Header>
  );
}

const useColorMapping = (
  property: keyof ViewStyle | keyof TextStyle,
  routeColors: RouteColor[] | undefined,
  route: Record<string, any>,
  style: StyleProp<ViewStyle | TextStyle>,
) => {
  const theme = useTheme();
  const title = route.params?.appTile?.title;
  const routeColor = routeColors?.find(
    (item) => item.route === route.name || item.route === title,
  );
  if (routeColor) {
    return [style, { [property]: routeColor.color(theme) }];
  }

  return style;
};

const Title = ({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}) => (
  <Text variant="titleMedium" style={style}>
    {text}
  </Text>
);

const backActionIcon: { color?: string } = {};
const defaultStyles = createStyles('AppNavHeader', (theme) => ({
  view: {
    backgroundColor: theme.colors.background,
  },
  contentView: {
    alignItems: 'center',
  },
  contentViewWithBackButton: {
    paddingRight: Platform.OS === 'android' ? 40 : 0,
  },
  titleText: {
    color: theme.colors.onSurfaceVariant,
  },
  backAction: {},
  backActionIcon: backActionIcon,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type AppNavHeaderStyles = NamedStylesProp<typeof defaultStyles>;
