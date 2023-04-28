import React, {
  FC,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, View, StyleSheet, ViewStyle } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import { StylesProp, useStyleOverrides } from '../styles';
import { usePrevious } from '../hooks/usePrevious';
import { darkenHexColor } from '../util/darken-hex-color';
import { useTheme } from '../../../hooks/useTheme';
import { shadow } from 'react-native-paper';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  color: string;
  radius?: number;
  strokeWidth?: number;
  target: number;
  value: number;
  disabled?: boolean;
};

export const RadialProgress: FC<Props> = (props) => {
  const { target: incomingTarget, value } = props;
  const { color = '', radius = 25, strokeWidth = 5, disabled = false } = props;
  const circumference = Math.PI * 2 * radius;
  const size = radius * 2 + strokeWidth;
  const target = incomingTarget || 1;

  const ref = useRef(new Animated.Value(circumference));
  const lastValue = usePrevious(value);
  const lastTarget = usePrevious(target);
  const hasChanged = lastValue !== value || lastTarget !== target;
  const [backgroundVisible, setBackgroundVisible] = useState(value > target);
  const [animationValue, setAnimationValue] = useState(circumference);
  const styles = useStyleOverrides(defaultStyles);
  const flatStyles = useFlattenedStyles(styles, [
    'trackerCircleBorder',
    'trackerCircleBorderDisabled',
  ]);
  const theme = useTheme();

  const moveProgressTo = useCallback(
    (position: 'start' | 'end') => {
      const value = position === 'start' ? circumference : 0;
      ref.current.setValue(value);
      setAnimationValue(value);
    },
    [circumference],
  );

  useLayoutEffect(() => {
    if (!hasChanged || value < 0) {
      return;
    }

    const hasExceededTarget = value > target;
    const isIncreasing = !lastValue || value > lastValue;
    const hasLoopedAround =
      Math.ceil((lastValue || 0) / target) !== Math.ceil(value / target);

    let shiftedValue = value % target;
    if (shiftedValue === 0 && isIncreasing) {
      shiftedValue = target;
    }

    if (isIncreasing && hasExceededTarget) {
      setBackgroundVisible(true);
    }

    const animationMax = 2 * target + (isIncreasing ? 1 : 0);

    // Don't animate if greater than twice the target
    if (value >= animationMax && !animationValue) {
      return;
    }

    if (value === 0 && isIncreasing) {
      return moveProgressTo('start');
    }

    if (hasLoopedAround && isIncreasing && value < animationMax) {
      moveProgressTo('start');
    }

    const newValue =
      circumference * (1 - Math.min(Math.max(shiftedValue / target, 0), 1));

    Animated.timing(ref.current, {
      useNativeDriver: true,
      toValue: newValue,
      easing: Easing.inOut(Easing.exp),
      duration: 450,
    }).start(() => {
      setAnimationValue(newValue);
      if (value <= 0) {
        moveProgressTo('start');
      } else if (shiftedValue === 0) {
        moveProgressTo('end');
      }

      if (!isIncreasing && !hasExceededTarget) {
        setBackgroundVisible(false);
      }
    });
  }, [
    animationValue,
    circumference,
    ref.current,
    value,
    target,
    lastValue,
    moveProgressTo,
    hasChanged,
  ]);

  return (
    <View style={[{ position: 'relative' }, shadow(3) as ViewStyle]}>
      <Svg viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke={flatStyles.trackerCircleBorder.borderColor}
          strokeWidth={flatStyles.trackerCircleBorder.borderWidth}
          strokeOpacity={
            disabled
              ? flatStyles.trackerCircleBorderDisabled.opacity
              : flatStyles.trackerCircleBorder.opacity
          }
          r={radius}
          fill={flatStyles.trackerCircleBorder.backgroundColor}
          cx={size / 2}
          cy={size / 2}
        />
        {!disabled && backgroundVisible && (
          <Circle
            stroke={color}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            origin={[size / 2, size / 2]}
            rotation={90}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {!disabled && value >= 0 && (
        <Svg
          viewBox={`0 0 ${size} ${size}`}
          style={[
            styles.trackerOverflowProgress,
            backgroundVisible && styles.trackerOverflowProgressShadow,
          ]}
        >
          <AnimatedCircle
            stroke={darkenHexColor(color, backgroundVisible ? -37 : 0)}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            origin={[size / 2, size / 2]}
            rotation={90}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ref.current}
            fill={theme.colors.surface}
          />
        </Svg>
      )}
    </View>
  );
};

declare module '../TrackTile' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  trackerCircleBorderDisabled: {
    opacity: 0.3,
  },
  trackerCircleBorder: {
    borderWidth: 2,
    opacity: 0.4,
    borderColor: '#B2B9C0',
    backgroundColor: undefined,
  },
  trackerOverflowProgress: {
    position: 'absolute',
  },
  trackerOverflowProgressShadow: {
    elevation: 1,
    shadowOpacity: 0.65,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 3,
  },
});
