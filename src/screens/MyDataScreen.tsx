import React, { useCallback, useMemo, useRef, useState } from 'react';
import { t } from 'i18next';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { ScreenSurface } from '../components/ScreenSurface';
import { LineChart } from '../components/MyData/LineChart';
import { SleepChart } from '../components/MyData/SleepChart';
import {
  DatePicker,
  DatePickerStyles,
} from '../components/TrackTile/TrackerDetails/DatePicker';
import {
  format,
  isAfter,
  startOfToday,
  endOfDay,
  addDays,
  addYears,
  addMonths,
  addWeeks,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutRectangle,
} from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { createStyles } from '../components';
import { useStyles, useTheme } from '../hooks';
import { SocialShareExporter } from '../components/SocialShare/SocialShareExporter';
import debounce from 'lodash/debounce';

export const MyDataScreen = () => {
  const { data: config, isLoading: loadingAppConfig } = useAppConfig();
  const { styles } = useStyles(defaultStyles);
  const [exportData, setExportData] = useState<any>();
  const [blockScroll, setBlockScroll] = useState(false);
  const [scrollOffset, setScrollOffset] = useState<LayoutRectangle>();
  const enabledChartState = useRef<Record<number, boolean>>({
    0: true,
    1: true,
  });
  const chartDimensions = useRef<Record<number, LayoutRectangle>>({});
  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const start = startOfWeek(startOfToday());
    const end = endOfDay(addDays(addWeeks(start, 1), -1));

    return {
      start,
      end,
    };
  });

  const onRangeChange = useCallback(
    (newRange: { start: Date; end: Date }) => {
      enabledChartState.current = {};
      setRange(newRange);
    },
    [enabledChartState],
  );

  const isEnabled = useCallback(
    (index: number) => {
      const dims = chartDimensions.current[index];

      if (enabledChartState.current[index] || !dims || !scrollOffset) {
        return !!enabledChartState.current[index];
      }

      const x1 = dims.y;
      const x2 = dims.y + dims.height;
      const y1 = scrollOffset.y;
      const y2 = scrollOffset.y + scrollOffset.height;

      return (enabledChartState.current[index] = x1 <= y2 && y1 <= x2);
    },
    [enabledChartState, chartDimensions, scrollOffset],
  );

  if (loadingAppConfig) {
    return (
      <ActivityIndicatorView
        message={t('home-screen-loading-config', 'Loading app config')}
      />
    );
  }

  return (
    <ScreenSurface
      testID="my-data-screen"
      scrollEnabled={!blockScroll}
      scrollViewProps={{
        scrollEventThrottle: 16,
        onScroll: (e) => {
          setScrollOffset({
            ...e.nativeEvent.contentOffset,
            ...e.nativeEvent.layoutMeasurement,
          });
        },
      }}
      Header={<DateRangeSelector range={range} onRangeChange={onRangeChange} />}
    >
      <View style={styles.container}>
        {config?.homeTab?.myDataSettings?.components.map((component, index) => (
          <React.Fragment key={`${component.type}-${index}`}>
            <View
              onLayout={(e) => {
                chartDimensions.current[index] = e.nativeEvent.layout;
              }}
            >
              {index > 0 && <Divider style={styles.dividerView} />}
              {component.type === 'LineChart' && (
                <LineChart
                  {...component}
                  dateRange={range}
                  padding={Number(styles.container?.paddingHorizontal) * 2}
                  onShare={setExportData}
                  enabled={isEnabled(index)}
                />
              )}
              {component.type === 'SleepChart' && (
                <SleepChart
                  {...component}
                  dateRange={range}
                  padding={Number(styles.container?.paddingHorizontal) * 2}
                  onShare={setExportData}
                  onBlockScrollChange={setBlockScroll}
                  enabled={isEnabled(index)}
                />
              )}
            </View>
          </React.Fragment>
        ))}

        <SocialShareExporter type="pointBreakdown" metadata={exportData} />
      </View>
    </ScreenSurface>
  );
};

type Period = {
  label: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  shiftByFn: (date: Date, amount: number) => Date;
  startOfPeriodFn: (date: Date | number) => Date;
};

const PERIODS: Period[] = [
  { label: 'DAY', shiftByFn: addDays, startOfPeriodFn: startOfDay },
  { label: 'WEEK', shiftByFn: addWeeks, startOfPeriodFn: startOfWeek },
  { label: 'MONTH', shiftByFn: addMonths, startOfPeriodFn: startOfMonth },
  { label: 'YEAR', shiftByFn: addYears, startOfPeriodFn: startOfYear },
];

type DateRangeSelectorProps = {
  range: { start: Date; end: Date };
  onRangeChange: (range: { start: Date; end: Date }) => void;
};

const DateRangeSelector = (props: DateRangeSelectorProps) => {
  const { range: rangeIn, onRangeChange } = props;
  const theme = useTheme();
  const { styles } = useStyles(defaultStyles);
  const [period, setPeriod] = useState(PERIODS[1]);
  const [range, setRange] = useState(rangeIn);

  const onRangeChangeDebounced = useMemo(
    () => debounce(onRangeChange, 450),
    [onRangeChange],
  );

  const setNewRange = useCallback(
    (
      newRangeFn: (prevState: { start: Date; end: Date }) => {
        start: Date;
        end: Date;
      },
    ) => {
      setRange((current) => {
        const newRange = newRangeFn(current);
        onRangeChangeDebounced(newRange);
        return newRange;
      });
    },
    [onRangeChangeDebounced],
  );

  const handlePeriodChange = useCallback(
    (newPeriod: Period) => () => {
      setNewRange((current) => ({
        start: newPeriod.startOfPeriodFn(current.start),
        end: endOfDay(
          addDays(
            newPeriod.shiftByFn(newPeriod.startOfPeriodFn(current.start), 1),
            -1,
          ),
        ),
      }));
      setPeriod(newPeriod);
    },
    [setNewRange],
  );

  return (
    <View style={styles.dateControlsContainer}>
      <ScrollView horizontal style={styles.periodScrollView}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.label}
            onPress={handlePeriodChange(p)}
            style={[
              styles.periodBubbleView,
              p.label === period.label && styles.periodBubbleSelectedView,
            ]}
          >
            <Text
              style={[
                styles.periodBubbleText,
                p.label === period.label && styles.periodBubbleSelectedText,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.datePickerContainer}>
        <DatePicker
          backAccessibilityLabel={t(
            'my-data.previous-periods-data',
            "Previous period's data",
          )}
          forwardAccessibilityLabel={t(
            'my-data.next-periods-data',
            "Next period's data",
          )}
          backValue={-1}
          forwardValue={1}
          dateText={
            period.label === 'DAY'
              ? t('my-data.date', {
                  defaultValue: '{{date}}',
                  date: format(range.start, 'MMMM dd, yyyy'),
                })
              : period.label === 'YEAR'
              ? t('track-tile.date', {
                  defaultValue: '{{date}}',
                  date: format(range.start, 'yyyy'),
                })
              : t('track-tile.date-range', {
                  defaultValue: '{{start}}-{{end}}',
                  start: format(range.start, 'MMMM dd'),
                  end: format(range.end, 'dd, yyyy'),
                })
          }
          color={
            styles.datePickerNavigatorContainer?.backgroundColor?.toString() ??
            theme.colors.primary
          }
          onChange={(shiftByDays) => {
            setNewRange((current) => ({
              start: period.shiftByFn(current.start, shiftByDays),
              end: period.shiftByFn(current.end, shiftByDays),
            }));
          }}
          iconDisabledCondition={isAfter(range.end, startOfToday())}
          styles={styles.datePickerStyles}
        />
      </View>
    </View>
  );
};

const defaultStyles = createStyles('MyDataScreen', (theme) => ({
  container: {
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 20,
  },
  dateControlsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  periodScrollView: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  periodBubbleView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    marginRight: 10,
  },
  periodBubbleSelectedView: {
    backgroundColor: theme.colors.secondary,
  },
  periodBubbleText: {
    paddingHorizontal: 15,
  },
  periodBubbleSelectedText: {
    color: theme.colors.onSecondary,
  },
  datePickerContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  datePickerStyles: {
    buttonContainer: {
      marginVertical: theme.spacing.extraSmall,
    },
  } as DatePickerStyles,
  datePickerNavigatorContainer: {
    backgroundColor: theme.colors.primary,
  },
  dividerView: {
    width: '100%',
    backgroundColor: theme.colors.onSurface,
    marginBottom: 24,
    marginTop: 5,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
