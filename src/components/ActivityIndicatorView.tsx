import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import useTimeout from 'react-use/lib/useTimeout';
import { tID } from '../common/testID';
import { createStyles } from '../components/BrandConfigProvider';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../hooks/useTheme';
import { Text } from 'react-native-paper';

interface Props {
  message?: string;
  timeOutMilliseconds?: number;
  style?: ActivityIndicatorViewStyles;
}

export function ActivityIndicatorView({
  message: messageText,
  timeOutMilliseconds,
  style: instanceStyles,
  ...props
}: Props & Omit<ActivityIndicator['props'], 'style'>) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { colors } = useTheme();
  const [showMessage] = useTimeout(timeOutMilliseconds || 5000);
  const { CustomActivityIndicatorView } = useDeveloperConfig();

  const timeOutMessage =
    !!messageText && !!showMessage() ? (
      <Text variant="labelSmall" style={styles.text}>
        {messageText}
      </Text>
    ) : null;

  return CustomActivityIndicatorView ? (
    <CustomActivityIndicatorView timeoutMessage={timeOutMessage} />
  ) : (
    <View style={styles.view}>
      <ActivityIndicator
        size="large"
        animating
        testID={tID('activity-indicator-view')}
        color={colors.primarySource}
        accessibilityRole="progressbar"
        {...props}
      />
      {timeOutMessage}
    </View>
  );
}

const defaultStyles = createStyles('ActivityIndicatorView', (theme) => ({
  view: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    margin: theme.spacing.medium,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ActivityIndicatorViewStyles = NamedStylesProp<typeof defaultStyles>;
