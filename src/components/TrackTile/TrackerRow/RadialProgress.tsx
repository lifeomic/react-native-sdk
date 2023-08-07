import React, {
  FC,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { usePrevious } from '../hooks/usePrevious';
import { darkenHexColor } from '../util/darken-hex-color';
import { useTheme } from '../../../hooks/useTheme';
import { shadow } from 'react-native-paper';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  color: string;
  radius?: number;
  strokeWidth?: number;
  target: number;
  value: number;
  disabled?: boolean;
  strokeLinecap?: 'round' | 'square' | 'butt';
  rotation?: number;
  styles?: RadialProgressStyles;
};

export const RadialProgress: FC<Props> = (props) => {
  const { target: incomingTarget, value } = props;
  const {
    color = '',
    radius = 25,
    strokeWidth = 5,
    disabled = false,
    strokeLinecap = 'round',
    rotation = 90,
  } = props;
  const circumference = Math.PI * 2 * radius;
  const size = radius * 2 + strokeWidth;
  const target = incomingTarget || 1;

  const ref = useRef(new Animated.Value(circumference));
  const lastValue = usePrevious(value);
  const lastTarget = usePrevious(target);
  const hasChanged = lastValue !== value || lastTarget !== target;
  const [backgroundVisible, setBackgroundVisible] = useState(value > target);
  const [animationValue, setAnimationValue] = useState(circumference);
  const { styles } = useStyles(defaultStyles, props.styles);
  const theme = useTheme();

  const moveProgressTo = useCallback(
    (position: 'start' | 'end') => {
      const newValue = position === 'start' ? circumference : 0;
      ref.current.setValue(newValue);
      setAnimationValue(newValue);
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
          stroke={styles.borderView?.borderColor}
          strokeWidth={styles.borderView?.borderWidth}
          strokeOpacity={
            disabled
              ? styles.disabledBorder?.opacity
              : styles.borderView?.opacity
          }
          r={radius}
          fill={styles.borderView?.backgroundColor}
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
            rotation={rotation}
            strokeWidth={strokeWidth}
            strokeLinecap={strokeLinecap}
          />
        )}
      </Svg>
      {!disabled && value >= 0 && (
        <Svg
          viewBox={`0 0 ${size} ${size}`}
          style={[
            styles.overflowContainer,
            backgroundVisible && styles.overflowShadow,
          ]}
        >
          <AnimatedCircle
            stroke={darkenHexColor(color, backgroundVisible ? -37 : 0)}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            origin={[size / 2, size / 2]}
            rotation={rotation}
            strokeWidth={strokeWidth}
            strokeLinecap={strokeLinecap}
            strokeDasharray={circumference}
            strokeDashoffset={ref.current}
            fill={theme.colors.surface}
          />
        </Svg>
      )}
    </View>
  );
};

const defaultStyles = createStyles('TrackerRadialProgress', () => ({
  disabledBorder: {
    opacity: 0.3,
  },
  borderView: {
    borderWidth: 2,
    opacity: 0.4,
    borderColor: '#B2B9C0',
    backgroundColor: undefined,
  },
  overflowContainer: {
    position: 'absolute',
  },
  overflowShadow: {
    elevation: 1,
    shadowOpacity: 0.65,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 3,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type RadialProgressStyles = NamedStylesProp<typeof defaultStyles>;
