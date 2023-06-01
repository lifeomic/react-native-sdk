import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ImageSourcePropType,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import i18n, { Trans, t } from '../../../../../lib/i18n';
import { Text, useFontOverrides } from '../../styles';
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
import {
  addDays,
  startOfToday,
  isBefore,
  startOfDay,
  endOfDay,
} from 'date-fns';
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
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

export type AdvancedTrackerDetailsProps = {
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  onError?: (e: any) => void;
  icons?: Record<string, ImageSourcePropType>;
  onEditValue: (value: TrackerValue) => void;
  children?: React.ReactNode;
  editsDisabledAfterNumberOfDays?: number;
  referenceDate?: Date;
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
  const {
    tracker,
    icons = {},
    valuesContext,
    onEditValue,
    onError,
    referenceDate: incomingReferenceDate,
  } = props;
  const defaultUnit = getStoredUnitType(tracker);
  const { styles } = useStyles(defaultStyles);
  const fontWeights = useFontOverrides();
  const svc = useTrackTileService();
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
        const newRelationships = flattenDepth(
          res?.map((code) => code.specializedBy) ?? [],
        );

        setRelationships(
          newRelationships.length
            ? newRelationships
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
            newRelationships?.map((code) => [
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
  }, [tracker.code, svc.fetchOntology, svc, tracker]);

  const addTrackerResource = useMemo(
    // This makes it so the user doesn't add too many records at once
    () =>
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
    [
      quickAddAmount,
      editsDisabled,
      svc,
      valuesContext,
      tracker,
      dateRange.start,
      metricId,
      onError,
    ],
  );

  const trackerValue = useCallback(
    (valueText?: string) => (
      <Text
        accessibilityLabel={t('track-tile.tracker-value-value', {
          defaultValue: 'Tracker value, {{value}}',
          value: currentValue,
        })}
        style={[fontWeights.regular, styles.trackerValueText]}
      >
        {valueText}
      </Text>
    ),
    [currentValue, fontWeights.regular, styles.trackerValueText],
  );

  const trackerDivider = useCallback(
    (dividerText?: string) => (
      <Text
        accessibilityElementsHidden
        style={[fontWeights.regular, styles.trackerValueDividerText]}
      >
        {dividerText}
      </Text>
    ),
    [fontWeights.regular, styles.trackerValueDividerText],
  );

  const trackerTarget = useCallback(
    (targetText?: string) => (
      <Text
        accessibilityLabel={t('track-tile.tracker-value-value', {
          defaultValue: 'Tracker target, {{value}}',
          value: target,
        })}
        style={[fontWeights.semibold, styles.trackerTargetText]}
      >
        {targetText}
      </Text>
    ),
    [fontWeights.semibold, styles.trackerTargetText, target],
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
        style={styles.horizontalRowContainer}
        i18nKey="track-tile.advanced-tracker-value"
        ns="track-tile-ui"
        defaults="<value>{{value}}</value><divider>/</divider><target>{{target}}</target>"
        values={{
          value: currentValue,
          target,
        }}
        components={{
          value: ((valueText?: string) => trackerValue(valueText))(),
          divider: ((dividerText?: string) => trackerDivider(dividerText))(),
          target: ((targetText?: string) => trackerTarget(targetText))(),
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
            <View style={styles.recentHistoryContainer}>
              <Text
                style={[fontWeights.semibold, styles.recentHistoryTitleText]}
              >
                {t('track-tile.add-recent', 'Add Recent')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentHistoryScrollViewContent}
                style={styles.recentHistoryScrollView}
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
                          styles.recentHistoryPillView,
                        ]}
                      >
                        <Text
                          style={[
                            fontWeights.semibold,
                            styles.recentHistoryPillText,
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

      <View style={styles.section}>
        <Text style={[fontWeights.bold, styles.sectionPrefixText]}>
          {t('track-tile.science-of-prefix', 'The science of')}
        </Text>
        <Text style={[fontWeights.bold, styles.sectionTitleText]}>
          {tracker.name}
        </Text>
        <Text style={styles.descriptionText}>{tracker.description}</Text>
      </View>

      {children}

      <View style={styles.section}>
        <Text style={[fontWeights.bold, styles.sectionPrefixText]}>
          {t('track-tile.weekly-metrics-prefix', 'Weekly Metrics')}
        </Text>
        <Text style={[fontWeights.bold, styles.sectionTitleText]}>
          {t('track-tile.total-daily-units', {
            defaultValue: 'Total Daily {{unit}}',
            unit: unitDisplay(targetAmount, true),
          })}
        </Text>

        <View style={styles.chartContainer}>
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
            referenceDate={dateRange.start}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const defaultStyles = createStyles('', () => ({
  horizontalRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    alignItems: 'center',
  },
  trackerValueText: {
    fontSize: 48,
  },
  trackerValueDividerText: {
    fontSize: 48,
    marginHorizontal: 12,
  },
  trackerTargetText: {
    fontSize: 24,
  },
  section: {
    padding: 35,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1,
  },
  sectionPrefixText: {
    textTransform: 'uppercase',
    fontSize: 12,
    color: '#52566A',
  },
  sectionTitleText: {
    fontSize: 34,
    color: '#35383D',
    lineHeight: 40.8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 24,
  },
  chartContainer: {
    marginTop: 30,
  },
  recentHistoryContainer: {
    paddingHorizontal: 35,
    paddingBottom: 20,
  },
  recentHistoryTitleText: {
    fontSize: 14,
    color: '#35383D',
    marginBottom: 12,
    lineHeight: 21,
  },
  recentHistoryScrollView: {
    overflow: 'visible',
    marginHorizontal: -35,
  },
  recentHistoryScrollViewContent: {
    paddingHorizontal: 35,
  },
  recentHistoryPillView: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 38,
    minWidth: 65,
    marginEnd: 8,
  },
  recentHistoryPillText: {
    color: 'white',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
