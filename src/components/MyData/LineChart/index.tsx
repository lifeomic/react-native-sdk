import React, { useMemo } from 'react';
import { VictoryChart, VictoryAxis } from 'victory-native';
import {
  format,
  addDays,
  differenceInDays,
  startOfDay,
  isSameDay,
} from 'date-fns';
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
import { DataSelector } from './DataSelector';
import { useChartData } from './useChartData';

type Props = {
  title: string;
  trace1: Trace;
  trace2?: Trace;
  dateRange: [Date, Date];
};

const LineChart = (props: Props) => {
  const { trace1, trace2, dateRange: incomingDateRange } = props;
  const dateRange = useMemo<[Date, Date]>(
    () => [startOfDay(incomingDateRange[0]), startOfDay(incomingDateRange[1])],
    [incomingDateRange],
  );
  const common = useCommonChartProps();
  const { styles } = useStyles(defaultStyles);
  const { trace1Data, trace2Data } = useChartData({
    trace1,
    trace2,
    dateRange,
  });

  const tickValues = useMemo(() => {
    let domain = dateRange;
    if (isSameDay(dateRange[0], dateRange[1])) {
      domain = [addDays(dateRange[0], -1), addDays(dateRange[0], 1)];
    }

    const ticks = Math.min(5, Math.abs(differenceInDays(...domain)));

    return scaleTime().domain([domain[0], domain[1]]).nice().ticks(ticks);
  }, [dateRange]);

  const domain: [number, number] = [
    +dateRange[0],
    +dateRange[dateRange.length - 1],
  ];

  return (
    <View style={styles.container}>
      <Title {...props} />
      <VictoryChart {...common}>
        <VictoryAxis
          {...common}
          standalone={false}
          tickValues={tickValues}
          tickFormat={(tick: number, index: number) =>
            format(new Date(tick), index === 0 ? 'MMM dd' : 'dd')
          }
        />
        <TraceLine trace={trace1} data={trace1Data} xDomain={domain} />
        {trace2 && (
          <TraceLine
            trace={trace2}
            data={trace2Data}
            xDomain={domain}
            variant="trace2"
          />
        )}
        <DataSelector
          xDomain={domain}
          dateRange={dateRange}
          trace1={trace1Data}
          trace2={trace2Data}
        />
      </VictoryChart>
    </View>
  );
};

const LineChartWrapper = (props: Props & { padding?: number }) => {
  const { padding = 0, ...lineChartProps } = props;
  const theme = useVictoryTheme();
  const width = Dimensions.get('window').width - padding;

  return (
    <CommonChartPropsProvider
      theme={theme}
      width={width}
      padding={padding + 10}
    >
      <LineChart {...lineChartProps} />
    </CommonChartPropsProvider>
  );
};

export { LineChartWrapper as LineChart };

const defaultStyles = createStyles('LineChart', () => ({
  container: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
