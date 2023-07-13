import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { VictoryChart, VictoryAxis } from 'victory-native';
import {
  format,
  addDays,
  differenceInDays,
  startOfDay,
  isSameDay,
} from 'date-fns';
import ViewShot from 'react-native-view-shot';
import { Trace, TraceLine } from './TraceLine';
import { useVictoryTheme } from '../useVictoryTheme';
import { scaleTime } from 'd3-scale';
import { Title } from './Title';
import { View, Dimensions } from 'react-native';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import {
  CommonChartPropsProvider,
  useCommonChartProps,
} from '../useCommonChartProps';
import { DataSelector, Selection } from './DataSelector';
import { PointData, useChartData } from './useChartData';
import { AxisArrows } from './AxisArrows';
import { defaultChartStyles } from '../styles';
import { Legend } from './Legend';

type Props = {
  title: string;
  trace1: Trace;
  trace2?: Trace;
  dateRange: {
    start: Date;
    end: Date;
  };
  onShare?: (config: {
    selectedPoints: PointData[];
    title: string;
    dataUri?: string;
    dateRange: [Date, Date];
  }) => void;
};

const LineChart = (props: Props) => {
  const {
    title,
    trace1,
    trace2,
    dateRange: incomingDateRange,
    onShare,
  } = props;
  const viewShotRef = useRef<ViewShot>(null);
  const [selection, setSelection] = useState<Selection>();
  const [showSelection, setShowSelection] = useState(false);
  const dateRange = useMemo<[Date, Date]>(
    () => [
      startOfDay(incomingDateRange.start),
      startOfDay(incomingDateRange.end),
    ],
    [incomingDateRange.start, incomingDateRange.end],
  );
  const common = useCommonChartProps();
  const { styles } = useStyles(defaultStyles);
  const { trace1Data, trace2Data } = useChartData({
    trace1,
    trace2,
    dateRange,
  });

  useEffect(() => {
    setSelection(undefined);
  }, [dateRange]);

  const tickValues = useMemo(() => {
    let domain = dateRange;
    if (isSameDay(dateRange[0], dateRange[1])) {
      domain = [addDays(dateRange[0], -1), addDays(dateRange[0], 1)];
    }

    const ticks = Math.min(5, Math.abs(differenceInDays(...domain)));

    return scaleTime().domain([domain[0], domain[1]]).nice().ticks(ticks);
  }, [dateRange]);

  const handleExport = useCallback(async () => {
    setShowSelection(true);
    const dataUri = await viewShotRef.current?.capture?.();
    onShare?.({
      selectedPoints: selection?.points ?? [],
      title,
      dataUri,
      dateRange,
    });
    setShowSelection(false);
  }, [title, selection?.points, dateRange, onShare]);

  const domain: [number, number] = useMemo(
    () => [+dateRange[0], +dateRange[1]],
    [dateRange],
  );

  return (
    <View style={styles.container}>
      <Title {...props} onShare={handleExport} />

      <View style={styles.chartWrapper}>
        <ViewShot ref={viewShotRef} options={{ format: 'png' }}>
          <Legend {...props} />
          <VictoryChart {...common}>
            <VictoryAxis
              {...common}
              standalone={false}
              tickValues={tickValues}
              tickFormat={(tick: number, index: number) =>
                format(new Date(tick), index === 0 ? 'MMM dd' : 'dd')
              }
            />
            <AxisArrows trace1={trace1} trace2={trace2} />
            <TraceLine
              trace={trace1}
              data={selectPoints(
                trace1Data,
                showSelection ? selection?.points : [],
              )}
              xDomain={domain}
            />
            {trace2 && (
              <TraceLine
                trace={trace2}
                data={selectPoints(
                  trace2Data,
                  showSelection ? selection?.points : [],
                )}
                xDomain={domain}
                variant="trace2"
              />
            )}
          </VictoryChart>
        </ViewShot>

        <View style={styles.dataSelectorContainer}>
          <DataSelector
            xDomain={domain}
            dateRange={dateRange}
            trace1={trace1Data}
            trace2={trace2Data}
            selection={selection}
            onChange={setSelection}
          />
        </View>
      </View>
    </View>
  );
};

const selectPoints = (data: PointData[], selectedPoints: PointData[] = []) =>
  selectedPoints.length
    ? data.map((d) => ({
        ...d,
        size: selectedPoints.some(
          (p) => p.x === d.x && p.y === d.y && p.trace === d.trace,
        )
          ? 8
          : d.size,
      }))
    : data;

const LineChartWrapper = (props: Props & { padding?: number }) => {
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
        left: padding + 10,
        right: padding + 10,
        top: 20,
        bottom: 40,
      }}
    >
      <LineChart {...lineChartProps} />
    </CommonChartPropsProvider>
  );
};

export { LineChartWrapper as LineChart };

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
