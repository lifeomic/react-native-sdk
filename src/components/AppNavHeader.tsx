import React from 'react';

import { Appbar, Text } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { TextStyle } from 'react-native';
import { ChevronLeft } from '@lifeomic/chromicons-native';

export function AppNavHeader({
  back,
  options,
  route,
  navigation,
}: NativeStackHeaderProps) {
  const { styles } = useStyles(defaultStyles);
  const title = options.title || route.name;

  return (
    <Appbar.Header style={styles.style} elevated>
      {back ? (
        <Appbar.Action
          icon={ChevronLeft}
          onPress={navigation.goBack}
          style={styles.backAction}
        />
      ) : null}
      <Appbar.Content
        title={<Title text={title} style={styles.titleText} />}
        style={styles.content}
      />
    </Appbar.Header>
  );
}

const Title = ({ text, style }: { text: string; style?: TextStyle }) => (
  <Text variant="titleMedium" style={style}>
    {text}
  </Text>
);

const defaultStyles = createStyles('AppNavHeader', (theme) => ({
  style: {
    backgroundColor: theme.colors.background,
  },
  content: {},
  titleText: {
    color: theme.colors.onSurfaceVariant,
  },
  backAction: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type AppNavHeaderStyles = NamedStylesProp<typeof defaultStyles>;
