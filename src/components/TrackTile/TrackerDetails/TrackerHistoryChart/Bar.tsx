import React, { FC, useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

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
  const { styles } = useStyles(defaultStyles);

  const barStyle =
    variant === 'flat' ? styles.flatVariantStyle : styles.defaultVariantStyle;

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
          backgroundColor: color || styles.backgroundColor?.backgroundColor,
        },
      ]}
    />
  );
};

const defaultStyles = createStyles('ChartBar', () => ({
  backgroundColor: {
    backgroundColor: '#EEF0F2',
  },
  defaultVariantStyle: {
    borderRadius: 30,
    width: 14,
  },
  flatVariantStyle: {
    width: 23.33,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default Bar;
