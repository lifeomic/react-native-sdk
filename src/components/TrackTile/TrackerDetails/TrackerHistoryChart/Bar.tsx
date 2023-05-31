import React, { FC, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

type BarProps = {
  percentComplete: number;
  animated?: boolean;
  color?: string;
  style?: BarStyles;
  testID?: string;
  variant?: 'default' | 'flat';
};

const Bar: FC<BarProps> = (props) => {
  const { animated, testID, variant, color, percentComplete } = props;
  const ref = useRef(new Animated.Value(animated ? 0 : percentComplete));
  const { styles } = useStyles(defaultStyles);

  const barStyle = variant === 'flat' ? styles.barFlat : styles.barDefault;
  const containerStyle =
    variant === 'flat' ? styles.containerFlat : styles.containerDefault;

  useEffect(() => {
    if (!animated) {
      ref.current.setValue(percentComplete);
      return;
    }

    Animated.timing(ref.current, {
      useNativeDriver: false,
      toValue: percentComplete,
      easing: Easing.inOut(Easing.exp),
      duration: 500,
    }).start();
  }, [animated, percentComplete]);

  return (
    <View style={containerStyle}>
      <Animated.View
        testID={testID}
        style={[
          {
            width: ref.current.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
          barStyle,
          { backgroundColor: color },
        ]}
      />
    </View>
  );
};

const defaultStyles = createStyles('ChartBar', (theme) => ({
  containerFlat: {
    borderWidth: 1,
    height: 25.33,
    backgroundColor: theme.colors.background,
  },
  containerDefault: {
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: theme.colors.background,
  },
  barDefault: {
    borderRadius: 30,
    height: 18,
  },
  barFlat: {
    height: 23,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type BarStyles = NamedStylesProp<typeof defaultStyles>;
export default Bar;
