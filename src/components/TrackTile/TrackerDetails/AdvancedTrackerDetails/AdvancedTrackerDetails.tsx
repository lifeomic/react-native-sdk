import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import i18n, { t } from 'i18next';
import { Trans } from 'react-i18next';
import {
  NamedStyles,
  StylesProp,
  useStyleOverrides,
  Text,
  useFontOverrides,
} from '../../styles';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
  useTrackTileService,
  CodedRelationship,
  Code,
} from '../../services/TrackTileService';
import { TrackerHistoryChart } from '../TrackerHistoryChart';
import { ScrollView } from 'react-native-gesture-handler';
import HorizontalScrollLayout from './HorizontalScrollLayout';
import { useTrackerValues } from '../../hooks/useTrackerValues';
import {
  convertToPreferredUnit,
  getPreferredUnitType,
  getStoredUnitType,
} from '../../util/convert-value';
import { numberFormatters } from '../../formatters';
import { addDays, endOfToday, startOfToday, isBefore } from 'date-fns';
import { toFhirResource } from '../to-fhir-resource';
import { throttle, flattenDepth } from 'lodash';
import { notifier } from '../../services/EmitterService';
import { QuickAddItem } from './QuickAddItem';
import { TrackerValueRow } from './TrackerValueRow';
import { tID } from '../../common/testID';
import { TransTextParent } from '../../common/TransTextParent';
import { isCodeEqual } from '../../util/is-code-equal';
import { useRecentCodedValues } from '../../hooks/useRecentCodedValues';
import { DatePicker } from '../DatePicker';
import { unitDisplay as baseUnitDisplay } from '../unit-display';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}

export type AdvancedTrackerDetailsProps = {
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  onError?: (e: any) => void;
  icons?: Record<string, ImageSourcePropType>;
  onEditValue: (value: TrackerValue) => void;
  children?: React.ReactNode;
  editsDisabledAfterNumberOfDays?: number;
};

const { numberFormat } = numberFormatters;

const extractCodeImage = (
  code: Code | undefined,
  codings: Code[],
  icons: Record<string, ImageSourcePropType>,
): ImageSourcePropType => {
  const matchingCode = codings.find((c) => isCodeEqual(c, code));

  if (matchingCode?.educationContent?.thumbnail) {
    return { uri: matchingCode?.educationContent?.thumbnail };
  }

  return icons[code?.display ?? ''];
};

export const AdvancedTrackerDetails = (props: AdvancedTrackerDetailsProps) => {
  const { children, editsDisabledAfterNumberOfDays = 7 } = props;
  const { tracker, icons = {}, valuesContext, onEditValue, onError } = props;
  const defaultUnit = getStoredUnitType(tracker);
  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();
  const svc = useTrackTileService();
  const [dateRange, setDateRange] = useState({
    start: startOfToday(),
    end: endOfToday(),
  });
  const {
    trackerValues: [activeValues],
  } = useTrackerValues(valuesContext, dateRange);
  const metricId = tracker.metricId ?? tracker.id;
  const recentCodedValues = useRecentCodedValues(metricId);
  const currentRecords = activeValues[metricId ?? ''] ?? [];
  const currentValue = convertToPreferredUnit(
    currentRecords.reduce((total, value) => total + value.value, 0),
    tracker,
  );
  const selectedUnit = getPreferredUnitType(tracker) || defaultUnit;
  const targetAmount = tracker.target ?? selectedUnit.target;
  const { quickAddAmount = 1 } = selectedUnit;
  const target = numberFormat(targetAmount);
  const [codings, setCodings] = useState<Code[]>([]);
  const [relationships, setRelationships] = useState<CodedRelationship[]>();
  const recentValues = recentCodedValues.filter(({ code }) =>
    codings.some((coding) => isCodeEqual(code, coding)),
  );
  const color = tracker.color;
  const editsDisabled = isBefore(
    dateRange.start,
    addDays(startOfToday(), -editsDisabledAfterNumberOfDays),
  );

  const unitDisplay = (value: number, skipInterpolation?: boolean) =>
    baseUnitDisplay({
      tracker,
      unit: selectedUnit,
      value,
      skipInterpolation,
    });

  useEffect(() => {
    svc
      .fetchOntology(tracker.code)
      .then((res) => {
        /**
         * Track Tile Ontologies assume a top level structure of:
         * ValueContext C/S -> Metric C/S -> Custom C/S -> Code Tree
         *
         * The Custom C/S is used to group a code systems under a metric
         * but is not usable within the UI. Here we skip over the first
         * layer of codes under the metric (Custom C/S) and merge the
         * underlying Code Trees.
         */
        const relationships = flattenDepth(
          res?.map((code) => code.specializedBy) ?? [],
        );

        setRelationships(
          relationships.length
            ? relationships
            : [
                {
                  ...tracker,
                  display: tracker.name,
                  specializedBy: [],
                },
              ],
        );
        setCodings(
          flattenDepth(
            relationships?.map((code) => [
              code,
              ...(code.specializedBy?.map((code2) => [
                code2,
                ...(code2.specializedBy?.map((code3) => code3) ?? []),
              ]) ?? []),
            ]),
            2,
          ) as Code[],
        );
      })
      .catch(() => setRelationships([]));
  }, [tracker.code, svc.fetchOntology]);

  const addTrackerResource = useCallback(
    // This makes it so the user doesn't add too many records at once
    throttle(async (code: Code, value = quickAddAmount) => {
      if (editsDisabled) {
        return;
      }

      try {
        const res = await svc.upsertTrackerResource(
          valuesContext,
          toFhirResource(
            tracker.resourceType,
            {
              ...svc,
              createDate: dateRange.start,
              value,
              tracker,
            },
            code,
          ),
        );
        notifier.emit('valuesChanged', [
          {
            valuesContext,
            metricId,
            tracker: res,
            saveToRecent: false, // don't add to recent items. It is already there or is a root option. LX has this functionality
          },
        ]);
      } catch (e) {
        onError?.(e);
      }
    }, 800),
    [tracker, svc, dateRange.start, editsDisabled, quickAddAmount],
  );

  return (
    <ScrollView>
      <DatePicker
        dateRange={dateRange}
        tracker={tracker}
        color={tracker.color}
        target={targetAmount}
        unit={selectedUnit}
        onChange={setDateRange}
      />

    <Trans
        i18n={i18n}
        parent={TransTextParent}
        style={styles.advancedDetailsHorizontalRow}
        i18nKey="track-tile.advanced-tracker-value"
        ns="track-tile-ui"
        defaults="<value>{{value}}</value><divider>/</divider><target>{{target}}</target>"
        values={{
          value: currentValue,
          target,
        }}
        components={{
          value: ((valueText?: string) => (
            <Text
              accessibilityLabel={t('track-tile.tracker-value-value', {
                defaultValue: 'Tracker value, {{value}}',
                value: currentValue,
              })}
              style={[fontWeights.regular, styles.advancedDetailsTrackerValue]}
            >
              {valueText}
            </Text>
          ))(),
          divider: ((dividerText?: string) => (
            <Text
              accessibilityElementsHidden
              style={[
                fontWeights.regular,
                styles.advancedDetailsTrackerValueDivider,
              ]}
            >
              {dividerText}
            </Text>
          ))(),
          target: ((targetText?: string) => (
            <Text
              accessibilityLabel={t('track-tile.tracker-value-value', {
                defaultValue: 'Tracker target, {{value}}',
                value: target,
              })}
              style={[
                fontWeights.semibold,
                styles.advancedDetailsTrackerTarget,
              ]}
            >
              {targetText}
            </Text>
          ))(),
        }}
      />

      {editsDisabled && (
        <Text style={{ textAlign: 'center' }}>
          {t(
            'track-tile.edits-not-allowed',
            'Unable to adjust data this far in the past.',
          )}
        </Text>
      )}
      {relationships ? (
        <>
          <HorizontalScrollLayout>
            {relationships.map((code) => (
              <QuickAddItem
                code={code}
                onPress={() => addTrackerResource(code)}
                disabled={editsDisabled}
                image={extractCodeImage(code, codings, icons)}
                key={code.id ?? code.code ?? code.display}
              />
            ))}
          </HorizontalScrollLayout>

          {!!recentValues.length && (
            <View style={styles.advancedDetailsRecentHistoryContainer}>
              <Text
                style={[
                  fontWeights.semibold,
                  styles.advancedDetailsRecentHistoryTitle,
                ]}
              >
                {t('track-tile.add-recent', 'Add Recent')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.advancedDetailsRecentHistoryScrollViewContent
                }
                style={styles.advancedDetailsRecentHistoryScrollView}
              >
                {recentValues.map(({ code, value }) => {
                  const isProcedure = tracker.resourceType === 'Procedure';
                  const { display } =
                    codings.find((c) => isCodeEqual(c, code)) ?? {};

                  return (
                    !!display && (
                      <TouchableOpacity
                        onPress={() =>
                          addTrackerResource(
                            code,
                            isProcedure
                              ? convertToPreferredUnit(value, tracker)
                              : undefined,
                          )
                        }
                        key={`${code.system}|${code.code}`}
                        style={[
                          { backgroundColor: color },
                          styles.advancedDetailsRecentHistoryPill,
                        ]}
                      >
                        <Text
                          style={[
                            fontWeights.semibold,
                            styles.advancedDetailsRecentHistoryPillText,
                          ]}
                        >
                          {t('track-tile.recent-item-text', {
                            defaultValue: '{{codeDisplay}} {{unit}}',
                            codeDisplay: display,
                            unit: isProcedure ? unitDisplay(value) : '',
                          }).trim()}
                        </Text>
                      </TouchableOpacity>
                    )
                  );
                })}
              </ScrollView>
            </View>
          )}
        </>
      ) : (
        <ActivityIndicator
          testID={tID('ontology-loading')}
          accessibilityRole="progressbar"
          size="large"
          style={{ marginVertical: 20 }}
        />
      )}

      {currentRecords.map((value, index) => (
        <TrackerValueRow
          key={value.id}
          onPress={() => onEditValue(value)}
          hasBorderTop={index === 0}
          color={color}
          title={value.code.coding[0]?.display ?? tracker.name}
          subTitle={unitDisplay(value.value)}
          image={extractCodeImage(value.code?.coding?.[0], codings, icons)}
        />
      ))}

      <View style={styles.advancedDetailsSection}>
        <Text style={[fontWeights.bold, styles.advancedDetailsSectionPrefix]}>
          {t('track-tile.science-of-prefix', 'The science of')}
        </Text>
        <Text style={[fontWeights.bold, styles.advancedDetailsSectionTitle]}>
          {tracker.name}
        </Text>
        <Text style={styles.advancedDetailsDescription}>
          {tracker.description}
        </Text>
      </View>

      {children}

      <View style={styles.advancedDetailsSection}>
        <Text style={[fontWeights.bold, styles.advancedDetailsSectionPrefix]}>
          {t('track-tile.weekly-metrics-prefix', 'Weekly Metrics')}
        </Text>
        <Text style={[fontWeights.bold, styles.advancedDetailsSectionTitle]}>
          {t('track-tile.total-daily-units', {
            defaultValue: 'Total Daily {{unit}}',
            unit: unitDisplay(targetAmount, true),
          })}
        </Text>

        <View style={styles.advancedDetailsChartContainer}>
          <TrackerHistoryChart
            variant="flat"
            stepperPosition="bottom"
            color={tracker.color}
            metricId={metricId}
            target={targetAmount}
            unit={selectedUnit.display}
            tracker={tracker}
            valuesContext={valuesContext}
            dateRangeType="calendarWeek"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const defaultStyles = StyleSheet.create({
  advancedDetailsHorizontalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    alignItems: 'center',
  },
  advancedDetailsTrackerValue: {
    fontSize: 48,
  },
  advancedDetailsTrackerValueDivider: {
    fontSize: 48,
    marginHorizontal: 12,
  },
  advancedDetailsTrackerTarget: {
    fontSize: 24,
  },
  advancedDetailsSection: {
    padding: 35,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1,
  },
  advancedDetailsSectionPrefix: {
    textTransform: 'uppercase',
    fontSize: 12,
    color: '#52566A',
  },
  advancedDetailsSectionTitle: {
    fontSize: 34,
    color: '#35383D',
    lineHeight: 40.8,
  },
  advancedDetailsDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 24,
  },
  advancedDetailsChartContainer: {
    marginTop: 30,
  },
  advancedDetailsRecentHistoryContainer: {
    paddingHorizontal: 35,
    paddingBottom: 20,
  },
  advancedDetailsRecentHistoryTitle: {
    fontSize: 14,
    color: '#35383D',
    marginBottom: 12,
    lineHeight: 21,
  },
  advancedDetailsRecentHistoryScrollView: {
    overflow: 'visible',
    marginHorizontal: -35,
  },
  advancedDetailsRecentHistoryScrollViewContent: {
    paddingHorizontal: 35,
  },
  advancedDetailsRecentHistoryPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 38,
    minWidth: 65,
    marginEnd: 8,
  },
  advancedDetailsRecentHistoryPillText: {
    color: 'white',
  },
});
