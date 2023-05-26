import React, { FC, useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';
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
          style,
          {
            backgroundColor: color || styles.backgroundColor?.backgroundColor,
          },
        ]}
      />
    </View>
  );
};

const defaultStyles = createStyles('ChartBar', () => ({
  containerFlat: { borderWidth: 1, height: 25.33 },
  containerDefault: { borderRadius: 30, borderWidth: 1, height: 20 },
  backgroundColor: {
    backgroundColor: '#EEF0F2',
  },
  barDefault: {
    borderRadius: 30,
    height: 18,
  },
  barFlat: {
    width: 23.33,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default Bar;
