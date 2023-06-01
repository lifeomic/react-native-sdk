import React from 'react';

import { Appbar, Text } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { createStyles, useIcons } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
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
  const title = options.title || route.name;
  const config = useDeveloperConfig();
  const headerStyles = useColorMapping(
    'backgroundColor',
    config.AppNavHeader?.headerColors,
    route,
    styles.style,
  );
  const titleStyles = useColorMapping(
    'color',
    config.AppNavHeader?.onHeaderColors,
    route,
    styles.titleText,
  );
  const statusBarHeight = config.AppNavHeader?.statusBarHeight;

  return (
    <Appbar.Header statusBarHeight={statusBarHeight} style={headerStyles}>
      {back ? (
        <Appbar.Action
          icon={ChevronLeft}
          color={styles.backActionIcon?.color}
          onPress={navigation.goBack}
          style={styles.backAction}
        />
      ) : null}
      <Appbar.Content
        title={<Title text={title} style={titleStyles} />}
        style={styles.content}
      />
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
  style: {
    backgroundColor: theme.colors.background,
  },
  content: {},
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
