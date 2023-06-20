import React, { useMemo } from 'react';
import { VictoryChart, VictoryAxis } from 'victory-native';
import { format, addDays, differenceInDays } from 'date-fns';
import { Trace, TraceLine } from './TraceLine';
import { useVictoryTheme } from '../useVictoryTheme';
import { scaleTime } from 'd3-scale';
import { Title } from './Title';
import { View } from 'react-native';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

type Props = {
  title: string;
  trace1: Trace;
  trace2?: Trace;
  dateRange: [Date, Date];
};

export const LineChart = (props: Props) => {
  const { trace1, trace2, dateRange } = props;
  const theme = useVictoryTheme();
  const { styles } = useStyles(defaultStyles);

  const tickValues = useMemo(() => {
    let domain = dateRange;
    const rangeInDays = Math.abs(differenceInDays(...dateRange));
    if (rangeInDays < 1) {
      domain = [addDays(dateRange[0], -2), addDays(dateRange[1], 1)];
    }

    const ticks = Math.min(5, Math.abs(differenceInDays(...domain)));

    return scaleTime().domain(domain).nice().ticks(ticks);
  }, [dateRange]);

  return (
    <View style={styles.container}>
      <Title {...props} />
      <VictoryChart theme={theme}>
        <VictoryAxis
          standalone={true}
          theme={theme}
          tickValues={tickValues}
          tickFormat={(tick: number, index: number) =>
            format(new Date(tick), index === 0 ? 'MMM dd' : 'dd')
          }
        />
        <TraceLine trace={trace1} dateRange={dateRange} />
        {trace2 && (
          <TraceLine trace={trace2} dateRange={dateRange} variant="secondary" />
        )}
      </VictoryChart>
    </View>
  );
};

const defaultStyles = createStyles('LineChart', () => ({
  container: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
