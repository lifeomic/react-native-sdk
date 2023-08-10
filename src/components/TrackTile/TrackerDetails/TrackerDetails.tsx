import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { t } from '../../../../lib/i18n';
import { UnitPicker } from './UnitPicker';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
  useTrackTileService,
} from '../services/TrackTileService';
import TrackAmountControl from './TrackAmountControl';
import { useSyncTrackerSettingsEffect } from './useSyncTrackerSettingsEffect';
import { useTrackerValues } from '../hooks/useTrackerValues';
import debounce from 'lodash/debounce';
import { notifier } from '../services/EmitterService';
import { toFhirResource } from './to-fhir-resource';
import { TrackerHistoryChart } from './TrackerHistoryChart';
import {
  convertToISONumber,
  convertToPreferredUnit,
  convertToStoreUnit,
  getPreferredUnitType,
  getStoredUnitType,
} from '../util/convert-value';
import { coerceToNonnegativeValue } from './coerce-to-nonnegative-value';
import { numberFormatters } from '../formatters';
import { endOfDay, isBefore, isToday, startOfDay } from 'date-fns';
import { NumberPicker } from './NumberPicker';
import { createStyles } from '../../../components/BrandConfigProvider';
import { useDeveloperConfig, useStyles, useTheme } from '../../../hooks';
import { unitDisplay } from './unit-display';
import { DayPicker } from './DayPicker';
import { RadialProgress } from '../TrackerRow/RadialProgress';

export type TrackerDetailsProps = {
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  referenceDate?: Date;
  onError?: (e: any) => void;
  canEditUnit?: boolean;
};

const { numberFormat } = numberFormatters;

export const TrackerDetails: FC<TrackerDetailsProps> = (props) => {
  const {
    tracker,
    valuesContext,
    referenceDate: incomingReferenceDate,
    onError,
    canEditUnit,
  } = props;
  const { componentProps } = useDeveloperConfig();
  const {
    showSimpleTargetMessage,
    radialProgressStrokeWidth,
    radialProgressRadius,
    radialProgressStrokeLinecap,
    radialProgressRotation,
    metricOverrides,
  } = componentProps?.TrackerDetails || {};
  const defaultUnit = getStoredUnitType(tracker);
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const svc = useTrackTileService();
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const referenceDate =
      incomingReferenceDate && isBefore(incomingReferenceDate, new Date())
        ? incomingReferenceDate
        : new Date();

    return {
      start: startOfDay(referenceDate),
      end: endOfDay(referenceDate),
    };
  });
  const {
    trackerValues: [activeValues],
    loading: fetchingTrackerValues,
  } = useTrackerValues(valuesContext, dateRange);
  const metricId = tracker.metricId ?? tracker.id;
  const incomingValue = (activeValues[metricId] ?? []).reduce(
    (total, { value }) => total + value,
    0,
  );

  const [currentValue, setCurrentValue] = useState(incomingValue ?? 0);
  const [selectedUnit, setSelectedUnit] = useState(
    getPreferredUnitType(tracker) || defaultUnit,
  );
  const [currentTarget, setCurrentTarget] = useState(
    tracker.target ?? selectedUnit.target,
  );
  const [target, setTarget] = useState(numberFormat(currentTarget));

  useEffect(() => {
    setCurrentValue(convertToPreferredUnit(incomingValue ?? 0, tracker));
  }, [incomingValue, tracker, selectedUnit, fetchingTrackerValues]);

  const updateTarget = useMemo(
    () => (newTarget: string) => {
      setTarget(newTarget);
      const formattedTarget = coerceToNonnegativeValue(
        convertToISONumber(newTarget),
        currentTarget,
      );
      setCurrentTarget(formattedTarget);
    },
    [currentTarget],
  );

  useSyncTrackerSettingsEffect(tracker, {
    target: currentTarget,
    unit: selectedUnit.unit,
  });

  const onSelectUnit = useCallback(
    (unit: string) => {
      const newUnitType = tracker.units.find((u) => u.unit === unit);
      const newUnit = newUnitType ?? defaultUnit;
      setSelectedUnit(newUnit);
    },
    [defaultUnit, tracker.units],
  );

  const saveNewValue = useMemo(
    () =>
      debounce(async (newValue: number) => {
        setSaveInProgress(true);
        try {
          const values = activeValues[metricId] ?? [];
          const cValue = values.reduce((total, { value }) => total + value, 0);
          const updates: TrackerValue[] = [];
          const deletes: TrackerValue[] = [];
          let trackerValueIndex = 0;
          let delta = convertToStoreUnit(newValue, tracker) - cValue;
          while (delta !== 0) {
            const trackerValue = values[trackerValueIndex];
            const resourceValue = (trackerValue?.value ?? 0) + delta;

            if (resourceValue > 0) {
              delta = 0;
              const res = await svc.upsertTrackerResource(
                valuesContext,
                toFhirResource(tracker.resourceType, {
                  ...svc,
                  createDate: isToday(dateRange.start)
                    ? new Date()
                    : dateRange.start,
                  ...activeValues[metricId]?.[0],
                  value: convertToPreferredUnit(resourceValue, tracker),
                  tracker,
                }),
              );
              updates.push(res);
            } else {
              trackerValueIndex++;
              delta = resourceValue;

              const removed = await svc.deleteTrackerResource(
                valuesContext,
                tracker.resourceType,
                trackerValue.id,
              );

              if (removed) {
                deletes.push(trackerValue);
              }
            }
          }

          const batchMeta = { valuesContext, metricId };
          notifier.emit('valuesChanged', [
            ...updates.map((newTracker) => ({
              ...batchMeta,
              tracker: newTracker,
            })),
            ...deletes.map((newTracker) => ({
              ...batchMeta,
              tracker: newTracker,
              drop: true,
            })),
          ]);
        } catch (e) {
          onError?.(e);
        }
        setSaveInProgress(false);
      }, 800),
    [activeValues, tracker, metricId, svc, valuesContext, dateRange, onError],
  );

  const onValueChange = useCallback(
    (newValue: number) => {
      setCurrentValue(newValue);
      saveNewValue(newValue);
    },
    [saveNewValue],
  );

  const overrides =
    metricOverrides && tracker.metricId
      ? metricOverrides(theme)?.[tracker.metricId]
      : {};
  const image = overrides?.image ?? tracker.image;
  const trackerImage = typeof image === 'string' ? { uri: image } : image;
  const trackerColor = overrides?.color ?? tracker.color;

  return (
    <ScrollView>
      <View style={styles.container}>
        <DayPicker
          dateRange={dateRange}
          onChange={setDateRange}
          target={currentTarget}
          tracker={tracker}
          unit={selectedUnit}
          color={trackerColor}
        />
        {trackerImage && (
          <View style={styles.imageProgressContainer}>
            <View style={styles.radialProgressContainer}>
              <RadialProgress
                disabled={false}
                color={trackerColor}
                target={currentTarget ?? 0}
                value={currentValue}
                strokeWidth={radialProgressStrokeWidth}
                radius={radialProgressRadius}
                strokeLinecap={radialProgressStrokeLinecap}
                rotation={radialProgressRotation}
                styles={{
                  borderView: styles.radialProgressBorderView,
                }}
              />
            </View>
            <View style={styles.imageContainer}>
              <Image source={trackerImage} style={styles.image} />
            </View>
          </View>
        )}
        <TrackAmountControl
          value={currentValue}
          onChange={onValueChange}
          color={trackerColor}
          saveInProgress={saveInProgress}
          styles={{
            valueInputContainer: styles.trackAmountControlValueInputContainer,
            valueLargeSizeText: styles.trackAmountControlValueLargeSizeText,
            valueMediumSizeText: styles.trackAmountControlValueMediumSizeText,
            valueSmallSizeText: styles.trackAmountControlValueSmallSizeText,
          }}
        />
        <View style={styles.targetContainer}>
          {showSimpleTargetMessage && (
            <Text
              accessible={false}
              style={styles.myTargetText}
              numberOfLines={1}
            >
              {selectedUnit.display}
            </Text>
          )}
          {!showSimpleTargetMessage && (
            <>
              <Text
                accessible={false}
                style={styles.myTargetText}
                numberOfLines={1}
              >
                {t('track-tile.my-target', 'My Target')}
              </Text>
              <View style={styles.targetTextContainer}>
                <Text style={[styles.targetText, { color: tracker.color }]}>
                  [{target}]
                </Text>
                {tracker.units.length > 1 && canEditUnit ? (
                  <UnitPicker
                    value={selectedUnit.unit}
                    onChange={onSelectUnit}
                    units={tracker.units}
                  />
                ) : (
                  <Text accessible={false} style={styles.singleUnitText}>
                    {unitDisplay({
                      tracker,
                      unit: selectedUnit,
                      value: Number.parseFloat(target),
                      skipInterpolation: true,
                    }).toLocaleLowerCase()}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
        <NumberPicker
          selectedUnit={selectedUnit}
          onChange={updateTarget}
          value={target}
          chevronColor={tracker.color}
        />
        <Divider style={styles.firstDivider} />
        <Text style={styles.descriptionText}>{tracker.description}</Text>
        <Divider style={styles.secondDivider} />
        <View style={styles.historyChartContainer}>
          <TrackerHistoryChart
            metricId={metricId}
            target={currentTarget}
            unit={selectedUnit.display}
            tracker={tracker}
            valuesContext={valuesContext}
            referenceDate={dateRange.start}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const defaultStyles = createStyles('TrackerDetails', (theme) => ({
  imageContainer: {
    width: 326,
    height: 210,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  radialProgressBorderView: {},
  radialProgressContainer: {},
  imageProgressContainer: {},
  trackAmountControlValueInputContainer: {},
  trackAmountControlValueLargeSizeText: {},
  trackAmountControlValueMediumSizeText: {},
  trackAmountControlValueSmallSizeText: {},
  container: {
    backgroundColor: theme.colors.elevation.level1,
    alignItems: 'center',
    flex: 1,
    minHeight: '100%',
    paddingBottom: 24,
    flexDirection: 'column',
  },
  descriptionText: {
    textAlign: 'left',
    color: '#000000',
    marginHorizontal: 39,
    fontSize: 14,
    lineHeight: 22,
  },
  targetContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    minHeight: 30,
    paddingBottom: 10,
  },
  targetTextContainer: {
    paddingTop: 4,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  targetText: {
    letterSpacing: 3,
    fontSize: 16,
    lineHeight: 19.5,
  },
  myTargetText: {
    color: '#333333',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    paddingTop: 16,
  },
  singleUnitText: {
    letterSpacing: 0.23,
    fontSize: 16,
    lineHeight: 19.5,
  },
  historyChartContainer: {
    width: '100%',
    paddingHorizontal: 8,
    flex: 1,
  },
  firstDivider: { width: 326, backgroundColor: 'black', marginVertical: 24 },
  secondDivider: { width: 326, backgroundColor: 'black', marginTop: 24 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackTileDetailsStyles = NamedStylesProp<typeof defaultStyles>;
