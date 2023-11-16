import { useMemo } from 'react';
import { useStyles } from '../../hooks';
import { VictoryThemeDefinition } from 'victory-core';
import { Trace } from './LineChart/TraceLine';
import { defaultChartStyles } from './styles';
import { merge } from 'lodash';

type VictoryTheme = VictoryThemeDefinition & {
  trendlineTheme: VictoryThemeDefinition;
};

export const useVictoryTheme = (
  trace?: Trace,
  variant: 'trace1' | 'trace2' = 'trace1',
): VictoryTheme => {
  const { styles } = useStyles(defaultChartStyles);

  return useMemo(() => {
    const theme: VictoryThemeDefinition = {
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

    const customTheme: VictoryTheme = {
      ...theme,
      trendlineTheme: {
        ...theme,
        line: merge({}, theme.line, { style: styles.trendline }),
      },
    };
    return customTheme;
  }, [styles, trace, variant]);
};
