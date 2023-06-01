import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import {
  View,
  Animated,
  Easing,
  TouchableOpacity,
  ColorValue,
} from 'react-native';
import { Text } from '../styles';
import Svg, { Rect, Pattern, Defs, Path } from 'react-native-svg';
import Indicator from '../icons/indicator';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
  useTrackTileService,
} from '../services/TrackTileService';
import debounce from 'lodash/debounce';
import { toFhirResource } from '../TrackerDetails/to-fhir-resource';
import { notifier } from '../services/EmitterService';
import { tID } from '../common/testID';
import {
  convertToPreferredUnit,
  getPreferredUnitType,
} from '../util/convert-value';
import { isCodeEqual } from '../util/is-code-equal';
import { useStyles } from '../../../hooks/useStyles';
import { createStyles } from '../../BrandConfigProvider';
import { useDynamicColorGroup } from '../../../hooks/useDynamicColorGroup';

type PillarProps = {
  trackerValues?: TrackerValue[];
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  loading?: boolean;
  onOpenDetails: () => void;
  onError?: (e: any) => void;
  onSaveNewValueOverride?: (newValue: number) => void;
  styles?: PillarStyles;
};

const processCurrentColor = (color?: ColorValue, currentColor?: string) =>
  color === 'currentColor' ? currentColor : color;

export const Pillar: FC<PillarProps> = (props) => {
  const {
    trackerValues,
    loading,
    onOpenDetails,
    onSaveNewValueOverride,
    onError,
    tracker,
    valuesContext,
    styles: instanceStyles,
  } = props;
  const { color, icon, target: installTarget } = tracker;
  const { onColor, backdrop } = useDynamicColorGroup(color);
  const selectedUnit = getPreferredUnitType(tracker);
  const { target: unitDefaultTarget, display, increment = 1 } = selectedUnit;
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const target = installTarget ?? unitDefaultTarget;
  const metGoalColor = processCurrentColor(
    styles.pillarIconGoalMetText?.color,
    color,
  );
  const notMetGoalColor = processCurrentColor(
    styles.pillarIconGoalNotMetText?.color,
    color,
  );

  const { current: progressHeight } = useRef(new Animated.Value(100));
  const { current: rotateAnimation } = useRef(new Animated.Value(0));
  const { current: opacityAnimation } = useRef(new Animated.Value(0));
  const value = convertToPreferredUnit(
    trackerValues?.reduce((total, { value: v }) => total + v, 0) ?? 0,
    tracker,
  );
  const [currentValue, setCurrentValue] = useState(value);

  const metricId = tracker.metricId ?? tracker.id;

  const hasMetGoal = currentValue >= target;

  const svc = useTrackTileService();

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const saveNewValue = useMemo(
    () =>
      debounce(async (newValue: number) => {
        try {
          // Find a default value to modify or a new one will be created
          const trackerValue = trackerValues?.find((v) =>
            isCodeEqual(v.code.coding[0], {
              system: tracker.system,
              code: metricId,
            }),
          );
          const res = await svc.upsertTrackerResource(
            valuesContext,
            toFhirResource(props.tracker.resourceType, {
              ...svc,
              createDate: trackerValue?.createdDate || new Date(),
              id: trackerValue?.id,
              value: newValue,
              tracker,
            }),
          );
          notifier.emit('valuesChanged', [
            { valuesContext, metricId, tracker: res },
          ]);
        } catch (e) {
          onError?.(e);
          setCurrentValue(
            convertToPreferredUnit(
              trackerValues?.reduce((total, { value: v }) => total + v, 0) ?? 0,
              tracker,
            ),
          );
        }
      }, 800),
    [
      trackerValues,
      svc,
      valuesContext,
      props.tracker.resourceType,
      tracker,
      metricId,
      onError,
    ],
  );

  const onAddData = useCallback(
    (increaseBy: number) => {
      if (onSaveNewValueOverride) {
        return onSaveNewValueOverride(increaseBy);
      }

      setCurrentValue((displayedValue) => {
        const storedValue = convertToPreferredUnit(
          trackerValues?.reduce((total, { value: v }) => total + v, 0) ?? 0,
          tracker,
        );

        const defaultCodingValue = convertToPreferredUnit(
          trackerValues?.find((v) =>
            isCodeEqual(v.code.coding[0], {
              system: tracker.system,
              code: metricId,
            }),
          )?.value ?? 0,
          tracker,
        );

        const delta = displayedValue - storedValue + increaseBy;

        const newValue = defaultCodingValue + delta;

        saveNewValue(newValue);

        return displayedValue + increaseBy;
      });
    },
    [onSaveNewValueOverride, trackerValues, tracker, saveNewValue, metricId],
  );

  useEffect(() => {
    progressHeight.setValue(100);
    opacityAnimation.setValue(0);
  }, [opacityAnimation, progressHeight]);

  useEffect(() => {
    rotateAnimation.setValue(1);
    const animations = [
      Animated.timing(progressHeight, {
        toValue:
          100 - Math.max(Math.min((currentValue / target) * 100, 100), 0),
        useNativeDriver: false,
        duration: 250,
        easing: Easing.out(Easing.linear),
      }),
    ];

    if (hasMetGoal) {
      rotateAnimation.setValue(0);
      animations.push(
        Animated.parallel([
          Animated.timing(opacityAnimation, {
            toValue: 1,
            useNativeDriver: false,
            duration: 350,
          }),
          Animated.spring(rotateAnimation, {
            velocity: 1,
            toValue: 0,
            useNativeDriver: false,
            stiffness: 120,
            mass: 1.5,
            damping: 22,
          }),
        ]),
      );
    }

    Animated.sequence(animations).start();
  }, [
    currentValue,
    target,
    hasMetGoal,
    progressHeight,
    opacityAnimation,
    rotateAnimation,
  ]);

  return (
    <View style={[styles.pillarViewWrapper]}>
      <View style={styles.pillarView}>
        <TouchableOpacity
          testID={tID(`pillar-tracker-${metricId}`)}
          onPress={onOpenDetails}
          style={{ alignItems: 'center' }}
        >
          <Indicator
            name={metricId}
            fallbackName={icon}
            color={hasMetGoal ? metGoalColor : notMetGoalColor}
            scale={1.8}
          />
          <View style={styles.pillarBase}>
            <View style={styles.pillarBackground} />
            {loading && (
              <Svg
                height="100%"
                preserveAspectRatio="none"
                opacity={0.45}
                testID={tID(`pillar-loading-${metricId}`)}
                style={styles.pillarLoading}
              >
                <Rect width="100%" height="100%" fill="url(#diagonalHatch)" />

                <Defs>
                  <Pattern
                    id="diagonalHatch"
                    patternUnits="userSpaceOnUse"
                    width="30"
                    height="30"
                  >
                    <Path
                      d="M-7.5,7.5 15,-15
                          M0,30 l30,-30
                          M22.5,37.5 l15,-15"
                      stroke={color}
                      strokeWidth={11}
                    />
                  </Pattern>
                </Defs>
              </Svg>
            )}
            {!loading && (
              <>
                <Animated.View
                  style={[
                    styles.pillarFill,
                    {
                      transform: [
                        {
                          translateY: progressHeight.interpolate({
                            inputRange: [0, 100],
                            outputRange: [0, 200],
                          }),
                        },
                      ],
                      backgroundColor: color,
                    },
                  ]}
                />
                {hasMetGoal && (
                  <View
                    style={[
                      { backgroundColor: backdrop },
                      styles.pillarStarBackground,
                    ]}
                  >
                    <Animated.View
                      style={{
                        opacity: opacityAnimation,
                        transform: [
                          {
                            rotateZ: rotateAnimation.interpolate({
                              inputRange: [-1, 1],
                              outputRange: ['-45rad', '45rad'],
                              easing: Easing.inOut(Easing.linear),
                            }),
                          },
                        ],
                      }}
                    >
                      <Indicator
                        name="pillars-goal-met-icon"
                        fallbackName="star"
                        color={onColor}
                        scale={1.1}
                      />
                    </Animated.View>
                  </View>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <Text
        testID={tID(`pillar-value-${metricId}`)}
        variant="bold"
        style={{ color, marginTop: 4, fontSize: 20 }}
      >
        {currentValue}
      </Text>
      <Text variant="bold" style={{ color, marginBottom: 6 }}>
        {display}
      </Text>
      <TouchableOpacity
        testID={tID(`pillar-increment-${metricId}`)}
        onPress={() => onAddData(increment)}
      >
        <Indicator
          name="pillars-add-data-button-icon"
          fallbackName="plus-circle"
          color={color}
          scale={2.1}
        />
      </TouchableOpacity>
    </View>
  );
};

const defaultPillarWidth = 37;

const defaultStyles = createStyles('Pillar', (theme) => ({
  pillarViewWrapper: {
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    width: defaultPillarWidth * 2,
  },
  pillarView: {
    flex: 1,
    alignItems: 'center',
  },
  pillarBase: {
    position: 'relative',
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.medium,
    marginBottom: 8,
    borderRadius: defaultPillarWidth,
    overflow: 'hidden',
  },
  pillarBackground: {
    position: 'absolute',
    width: defaultPillarWidth,
    height: '100%',
    backgroundColor: theme.colors.surfaceVariant,
  },
  pillarFill: {
    width: defaultPillarWidth,
    height: '100%',
    borderRadius: defaultPillarWidth,
  },
  pillarStarBackground: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    borderRadius: defaultPillarWidth,
    width: defaultPillarWidth - 4,
    height: defaultPillarWidth - 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarLoading: {
    width: defaultPillarWidth,
  },
  /**
   * @property {string} color - Set to 'currentValue' to use the tracker's color
   */
  pillarIconGoalMetText: {
    color: 'currentColor',
  },
  /**
   * @property {string} color - Set to 'currentValue' to use the tracker's color
   */
  pillarIconGoalNotMetText: {
    color: theme.colors.onSurfaceDisabled,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PillarStyles = NamedStylesProp<typeof defaultStyles>;
