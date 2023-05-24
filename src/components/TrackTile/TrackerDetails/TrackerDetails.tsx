import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { t } from '../../../../lib/i18n';
import {
  NamedStyles,
  StylesProp,
  useStyleOverrides,
  Text,
  useFontOverrides,
} from '../styles';
import { UnitPicker } from './UnitPicker';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
  useTrackTileService,
} from '../services/TrackTileService';
import Indicator from '../icons/indicator';
import TrackAmountControl from './TrackAmountControl';
import { useSyncTrackerSettingsEffect } from './useSyncTrackerSettingsEffect';
import { useTrackerValues } from '../hooks/useTrackerValues';
import debounce from 'lodash/debounce';
import { notifier } from '../services/EmitterService';
import { toFhirResource } from './to-fhir-resource';
import { TrackerHistoryChart } from './TrackerHistoryChart';
import { ScrollView } from 'react-native-gesture-handler';
import { tID } from '../common/testID';
import {
  convertToISONumber,
  convertToPreferredUnit,
  convertToStoreUnit,
  getPreferredUnitType,
  getStoredUnitType,
} from '../util/convert-value';
import { coerceToNonnegativeValue } from './coerce-to-nonnegative-value';
import { numberFormatters } from '../formatters';
import { endOfToday, isToday, startOfToday } from 'date-fns';
import { DatePicker } from './DatePicker';
import { useDynamicColorGroup } from '../../../hooks/useDynamicColorGroup';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}
export type TrackerDetailsProps = {
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  onError?: (e: any) => void;
  canEditUnit?: boolean;
};

const { numberFormat } = numberFormatters;

export const TrackerDetails: FC<TrackerDetailsProps> = (props) => {
  const { tracker, valuesContext, onError, canEditUnit } = props;
  const { colorContainer } = useDynamicColorGroup(tracker.color);
  const defaultUnit = getStoredUnitType(tracker);
  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();
  const svc = useTrackTileService();
  const [dateRange, setDateRange] = useState({
    start: startOfToday(),
    end: endOfToday(),
  });
  const {
    trackerValues: [todaysValues],
    loading: fetchingTrackerValues,
  } = useTrackerValues(valuesContext, dateRange);
  const metricId = tracker.metricId ?? tracker.id;
  const incomingValue = (todaysValues[metricId] ?? []).reduce(
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

  const updateTarget = useCallback(() => {
    setTarget((newTarget: string) => {
      const formattedTarget = coerceToNonnegativeValue(
        convertToISONumber(newTarget),
        currentTarget,
      );
      setCurrentTarget(formattedTarget);
      return numberFormat(formattedTarget);
    });
  }, [currentTarget]);

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
        try {
          const values = todaysValues[metricId] ?? [];
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
                  ...todaysValues[metricId]?.[0],
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
      }, 800),
    [todaysValues, tracker, metricId, svc, valuesContext, dateRange, onError],
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
      <View style={styles.trackerDetailsContainer}>
        <DatePicker
          color="#02BFF1"
          dateRange={dateRange}
          onChange={setDateRange}
          target={currentTarget}
          tracker={tracker}
          unit={selectedUnit}
        />
        <View
          style={[
            { backgroundColor: colorContainer },
            styles.trackerDetailsHeaderContainer,
          ]}
        >
          <Indicator
            name={metricId}
            fallbackName={tracker.icon}
            color={tracker.color}
            scale={2.6}
          />
        </View>
        <TrackAmountControl
          value={currentValue}
          onChange={onValueChange}
          color={tracker.color}
        />
        <Text style={styles.trackerDetailsDescription}>
          {tracker.description}
        </Text>
        <View style={styles.trackerDetailsTargetContainer}>
          <Text
            accessible={false}
            style={styles.trackerDetailsMyTarget}
            numberOfLines={1}
          >
            {t('track-tile.my-target', 'My Target')}
          </Text>
          <TextInput
            testID={tID('tracker-target-input')}
            accessibilityLabel={t('track-tile.target-input', 'Target Input')}
            value={target}
            style={[fontWeights.semibold, styles.trackerDetailsTargetInput]}
            onChangeText={setTarget}
            onBlur={updateTarget}
            onSubmitEditing={updateTarget}
            returnKeyType="done"
            keyboardType="numeric"
            placeholder={numberFormat(selectedUnit.target)}
            numberOfLines={1}
            editable={canEditUnit}
          />
          {tracker.units.length > 1 && canEditUnit ? (
            <UnitPicker
              value={selectedUnit.unit}
              onChange={onSelectUnit}
              units={tracker.units}
            />
          ) : (
            <Text
              accessible={false}
              variant="semibold"
              style={styles.trackerDetailsSingleUnit}
            >
              {selectedUnit.display.toLocaleLowerCase()}
            </Text>
          )}
        </View>
        <View style={styles.trackerDetailsHistoryChartContainer}>
          <TrackerHistoryChart
            metricId={metricId}
            target={currentTarget}
            unit={selectedUnit.display}
            tracker={tracker}
            valuesContext={valuesContext}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const defaultStyles = StyleSheet.create({
  trackerDetailsContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    flex: 1,
    minHeight: '100%',
    paddingBottom: 24,
  },
  trackerDetailsHeaderContainer: {
    width: '100%',
    flex: 1,
    maxHeight: 153,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 37.5,
    minHeight: 120,
  },
  trackerDetailsDescription: {
    textAlign: 'center',
    color: '#000000',
    marginTop: 30,
    marginBottom: 6,
    marginHorizontal: 39,
    fontSize: 14,
    lineHeight: 22,
  },
  trackerDetailsTargetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    minHeight: 30,
    paddingBottom: 10,
    marginHorizontal: 54,
    borderBottomColor: '#E6E6E6',
    borderBottomWidth: 1,
  },
  trackerDetailsMyTarget: {
    color: '#333333',
    letterSpacing: 0.23,
    fontSize: 16,
    lineHeight: 16,
  },
  trackerDetailsSingleUnit: {
    color: '#262C32',
    letterSpacing: 0.23,
    fontSize: 16,
    lineHeight: 16,
  },
  trackerDetailsTargetInput: {
    flex: 1,
    color: '#262C32',
    fontSize: 24,
    marginRight: 7,
    textAlign: 'right',
    alignSelf: 'stretch',
    marginTop: 'auto',
    marginBottom: -2,
    paddingTop: 14,
  },
  trackerDetailsHistoryChartContainer: {
    width: '100%',
    paddingHorizontal: 34,
    marginTop: 10,
    flex: 1,
  },
});
