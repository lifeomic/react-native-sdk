import { useStyles } from '../../hooks';
import { VictoryThemeDefinition } from 'victory-core';
import { Trace } from './LineChart/TraceLine';
import { defaultChartStyles } from './styles';
import { merge } from 'lodash';

export const useVictoryTheme = (
  trace?: Trace,
  variant: 'trace1' | 'trace2' = 'trace1',
): VictoryThemeDefinition => {
  const { styles } = useStyles(defaultChartStyles);

  return {
    axis: {
      style: styles.independentAxis,
    },
    dependentAxis: {
      style: merge(
        {
          axis: {
            stroke: trace?.color ?? styles.colors?.[variant],
          },
          tickLabels: {
            fill: trace?.color ?? styles.colors?.[variant],
          },
          axisLabel: {
            fill: trace?.color ?? styles.colors?.[variant],
          },
        },
        styles.dependentAxis,
      ),
    },
    line: {
      style: merge(
        {
          data: {
            stroke: trace?.color ?? styles.colors?.[variant],
          },
        },
        styles.line,
      ),
    },
    scatter: {
      style: merge(
        {
          data: {
            fill: trace?.color ?? styles.colors?.[variant],
          },
        },
        styles.scatter,
      ),
    },
  };
};
