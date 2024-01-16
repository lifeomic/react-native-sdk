import React, {
  FC,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';
import { Svg, Circle, Linecap } from 'react-native-svg';
import { usePrevious } from '../hooks/usePrevious';
import { darkenHexColor } from '../util/darken-hex-color';
import { shadow } from 'react-native-paper';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  color: string;
  target: number;
  value: number;
  disabled?: boolean;
  strokeLinecap?: string;
  rotation?: number;
  styles?: RadialProgressStyles;
};

export const RadialProgress: FC<Props> = (props) => {
  const { target: incomingTarget, value } = props;
  const { color = '', disabled = false } = props;
  const { styles } = useStyles(defaultStyles, props.styles);
  const radius = styles.circle?.radius || 25;
  const rotation = styles.circle?.rotation || 90;
  const strokeLinecap = styles.circle?.strokeLinecap || 'round';
  const circumference = Math.PI * 2 * radius;
  const size = radius * 2 + (styles.animated?.strokeWidth || 5);
  const target = incomingTarget || 1;

  const ref = useRef(new Animated.Value(circumference));
  const lastValue = usePrevious(value);
  const lastTarget = usePrevious(target);
  const hasChanged = lastValue !== value || lastTarget !== target;
  const [backgroundVisible, setBackgroundVisible] = useState(value > target);
  const [animationValue, setAnimationValue] = useState(circumference);

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
    <View
      style={[
        {
          borderRadius: size,
        },
        styles.container,
        shadow(styles.circle?.shadow) as ViewStyle,
      ]}
    >
      <Svg viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke={styles.circle?.stroke}
          strokeWidth={styles.circle?.strokeWidth}
          strokeOpacity={
            disabled ? styles.disabledBorder?.opacity : styles.circle?.opacity
          }
          r={radius}
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
            strokeWidth={styles.circle?.strokeWidth}
            strokeLinecap={strokeLinecap as Linecap}
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
            strokeWidth={styles.animated?.strokeWidth}
            strokeLinecap={strokeLinecap as Linecap}
            strokeDasharray={circumference}
            strokeDashoffset={ref.current}
            fill={styles.circle?.backgroundColor}
          />
        </Svg>
      )}
    </View>
  );
};

const defaultStyles = createStyles('TrackerRadialProgress', (theme) => ({
  container: {
    position: 'relative',
    backgroundColor: 'white',
  },
  disabledBorder: {
    opacity: 0.3,
  },
  circle: {
    radius: 25,
    rotation: 90,
    strokeWidth: 5,
    strokeLinecap: 'round',
    shadow: 3,
    backgroundColor: theme.colors.surface,
    opacity: 0.4,
    stroke: '#B2B9C0',
  },
  animated: {
    strokeWidth: 5,
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
