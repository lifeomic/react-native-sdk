import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { startOfDay, differenceInDays } from 'date-fns';
import ViewShot from 'react-native-view-shot';
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
};

const SleepChart = (props: Props) => {
  const { title, dateRange: incomingDateRange, onShare } = props;
  const viewShotRef = useRef<ViewShot>(null);
  const [_showSelection, setShowSelection] = useState(false);
  const [isSwitchingChartType, setIsSwitchingChartType] = useState(false);
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
    setShowSelection(true);
    const dataUri = await viewShotRef.current?.capture?.();
    onShare?.({
      selectedPoints: [],
      title,
      dataUri,
      dateRange,
    });
    setShowSelection(false);
  }, [title, dateRange, onShare]);

  const ChartType = useMemo(
    () => (differenceInDays(...dateRange) === 0 ? DailyChart : MultiDayChart),
    [dateRange],
  );

  useEffect(() => setIsSwitchingChartType(true), [ChartType]);
  useEffect(() => {
    // end existing switch once isFetching is false
    setIsSwitchingChartType(
      (chartTypeChanged) => chartTypeChanged && chartData.isFetching,
    );
  }, [chartData.isFetching]);

  return (
    <View style={styles.container}>
      <Title {...props} onShare={handleExport} />

      <View style={styles.chartWrapper}>
        <ChartType
          viewShotRef={viewShotRef}
          {...chartData}
          // Hide data when switching, multi-day data does not render well on daily
          sleepData={isSwitchingChartType ? [] : chartData.sleepData}
          // Use incoming date range when switching, multi-day chart shows single day when switching from daily
          dateRange={isSwitchingChartType ? dateRange : chartData.dateRange}
        />
      </View>
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

const defaultStyles = createStyles('LineChart', () => ({
  container: {},
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
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
