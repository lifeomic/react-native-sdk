import React, { FC, useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle, StyleSheet } from 'react-native';
import { useFlattenedStyles } from '../../hooks/useFlattenedStyles';
import { StylesProp, useStyleOverrides } from '../../styles';

type BarProps = {
  percentComplete: number;
  animated?: boolean;
  color?: string;
  style?: ViewStyle;
  testID?: string;
  variant?: 'default' | 'flat';
};

const Bar: FC<BarProps> = (props) => {
  const { percentComplete, animated, style, testID, color, variant } = props;
  const ref = useRef(new Animated.Value(animated ? 0 : percentComplete));
  const styles = useStyleOverrides(defaultStyles);
  const flatStyles = useFlattenedStyles(styles, ['chartBarBackgroundColor']);

  const barStyle =
    variant === 'flat' ? styles.chartBarFlat : styles.chartBarDefault;

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
    <Animated.View
      testID={testID}
      style={[
        {
          height: ref.current.interpolate({
            inputRange: [0, 1],
            outputRange: ['-0.1%', '100%'],
          }),
        },
        barStyle,
        style,
        {
          backgroundColor:
            color || flatStyles.chartBarBackgroundColor.backgroundColor,
        },
      ]}
    />
  );
};

declare module '../TrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  chartBarBackgroundColor: {
    backgroundColor: '#EEF0F2',
  },
  chartBarDefault: {
    borderRadius: 30,
    width: 14,
  },
  chartBarFlat: {
    width: 23.33,
  },
});

export default Bar;
