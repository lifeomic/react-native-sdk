import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
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
import { ScrollView } from 'react-native-gesture-handler';
import {
  convertToISONumber,
  convertToPreferredUnit,
  convertToStoreUnit,
  getPreferredUnitType,
  getStoredUnitType,
} from '../util/convert-value';
import { coerceToNonnegativeValue } from './coerce-to-nonnegative-value';
import { numberFormatters } from '../formatters';
import { endOfDay, isToday, startOfDay } from 'date-fns';
import { DatePicker } from './DatePicker';
import { NumberPicker } from './NumberPicker';
import { createStyles } from '../../../components/BrandConfigProvider';
import { useStyles } from '../../../hooks';
import { unitDisplay } from './unit-display';

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
  const defaultUnit = getStoredUnitType(tracker);
  const { styles } = useStyles(defaultStyles);
  const svc = useTrackTileService();
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const referenceDate = incomingReferenceDate ?? Date.now();
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

  return (
    <ScrollView>
      <View style={styles.container}>
        <DatePicker
          color="#02BFF1"
          dateRange={dateRange}
          onChange={setDateRange}
          target={currentTarget}
          tracker={tracker}
          unit={selectedUnit}
        />
        <TrackAmountControl
          value={currentValue}
          onChange={onValueChange}
          color={tracker.color}
          saveInProgress={saveInProgress}
        />
        <View style={styles.targetContainer}>
          <Text
            accessible={false}
            style={styles.myTargetText}
            numberOfLines={1}
          >
            {t('track-tile.my-target', 'My Target')}
          </Text>
          <View
            style={{
              paddingTop: 4,
              flexDirection: 'row',
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: tracker.color,
                letterSpacing: 3,
                fontSize: 16,
                lineHeight: 19.5,
              }}
            >
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
        </View>
        <NumberPicker
          selectedUnit={selectedUnit}
          onChange={updateTarget}
          value={target}
        />
        <Divider
          style={{ width: 326, backgroundColor: 'black', marginVertical: 24 }}
        />
        <Text style={styles.descriptionText}>{tracker.description}</Text>
        <Divider
          style={{ width: 326, backgroundColor: 'black', marginTop: 24 }}
        />
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

const defaultStyles = createStyles('TrackerDetails', () => ({
  container: {
    backgroundColor: 'white',
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
  myTargetText: {
    color: '#333333',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    paddingTop: 16,
  },
  singleUnitText: {
    color: '#262C32',
    letterSpacing: 0.23,
    fontSize: 16,
    lineHeight: 19.5,
  },
  historyChartContainer: {
    width: '100%',
    paddingHorizontal: 34,
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackTileDetails = NamedStylesProp<typeof defaultStyles>;
