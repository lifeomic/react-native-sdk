import React, { useCallback, useMemo, useRef } from 'react';
import { startOfDay, differenceInDays } from 'date-fns';
import ViewShot from 'react-native-view-shot';
import { t } from 'i18next';
import { useVictoryTheme } from '../useVictoryTheme';
import { Title } from '../common/Title';
import { View, Dimensions } from 'react-native';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import { CommonChartPropsProvider } from '../useCommonChartProps';
import { defaultChartStyles } from '../styles';
import { useSleepChartData } from './useSleepChartData';
import { DailyChart } from './DailyChart';
import { MultiDayChart } from './MultiDayChart';
import { SegmentedButtons } from 'react-native-paper';
import { SleepSummary } from './SleepSummary';

type Props = {
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  onShare?: (config: {
    selectedPoints: [];
    title: string;
    dataUri?: string;
    dateRange: [Date, Date];
  }) => void;
  onBlockScrollChange: (shouldBlock: boolean) => void;
};

const SleepChart = (props: Props) => {
  const { title, dateRange: incomingDateRange, onShare } = props;
  const { onBlockScrollChange } = props;
  const viewShotRef = useRef<ViewShot>(null);
  const [isTimelineView, setIsTimelineView] = React.useState(true);
  const dateRange = useMemo<[Date, Date]>(
    () => [
      startOfDay(incomingDateRange.start),
      startOfDay(incomingDateRange.end),
    ],
    [incomingDateRange.start, incomingDateRange.end],
  );
  const { styles } = useStyles(defaultStyles);
  const chartData = useSleepChartData({ dateRange });

  const handleExport = useCallback(async () => {
    const dataUri = await viewShotRef.current?.capture?.();
    onShare?.({
      selectedPoints: [],
      title,
      dataUri,
      dateRange,
    });
  }, [title, dateRange, onShare]);

  const ChartType = useMemo(
    () => (differenceInDays(...dateRange) === 0 ? DailyChart : MultiDayChart),
    [dateRange],
  );

  const isSwitchingChartType = useMemo(
    () =>
      differenceInDays(...dateRange) !==
      differenceInDays(...chartData.dateRange),
    [dateRange, chartData.dateRange],
  );

  return (
    <View style={styles.container}>
      <Title {...props} onShare={handleExport} />

      <View style={styles.chartWrapper}>
        {isTimelineView ? (
          <ChartType
            viewShotRef={viewShotRef}
            onBlockScrollChange={onBlockScrollChange}
            {...chartData}
            // Hide data when switching, multi-day data does not render well on daily
            sleepData={isSwitchingChartType ? [] : chartData.sleepData}
            // Use incoming date range when switching, multi-day chart shows single day when switching from daily
            dateRange={isSwitchingChartType ? dateRange : chartData.dateRange}
          />
        ) : (
          <ViewShot ref={viewShotRef} options={{ format: 'png' }}>
            <SleepSummary {...chartData} />
          </ViewShot>
        )}
      </View>

      <SegmentedButtons
        onValueChange={(value) => setIsTimelineView(value === 'true')}
        value={`${isTimelineView}`}
        density="high"
        style={styles.chartToggleView}
        buttons={[
          {
            value: 'true',
            label: t('sleep-analysis-toggle-details', 'Details'),
          },
          {
            value: 'false',
            label: t('sleep-analysis-toggle-summary', 'Summary'),
          },
        ]}
      />
    </View>
  );
};

const SleepChartWrapper = (props: Props & { padding?: number }) => {
  const { padding = 0, ...lineChartProps } = props;
  const theme = useVictoryTheme();
  const { styles } = useStyles(defaultChartStyles);
  const width = styles.chart?.width ?? Dimensions.get('window').width - padding;

  return (
    <CommonChartPropsProvider
      theme={theme}
      width={width}
      height={styles.chart?.height ?? 300}
      padding={{
        left: padding + 5,
        right: padding - 10,
        top: padding - 30,
        bottom: padding - 5,
      }}
    >
      <SleepChart {...lineChartProps} />
    </CommonChartPropsProvider>
  );
};

export { SleepChartWrapper as SleepChart };

const defaultStyles = createStyles('SleepChart', () => ({
  container: {
    width: '100%',
  },
  chartWrapper: {
    position: 'relative',
  },
  dataSelectorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chartToggleView: {
    margin: 16,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
