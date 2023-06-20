import { useTheme } from '../../hooks';
import { VictoryTheme } from 'victory-native';

type Theme = (typeof VictoryTheme)['grayscale'];

export const useVictoryTheme = (
  variant: 'primary' | 'secondary' = 'primary',
): Theme => {
  const theme = useTheme();

  return {
    axis: {
      style: {
        grid: {
          strokeDasharray: '0 2 0',
          stroke: theme.colors.outline,
        },
        axis: {
          stroke: theme.colors.onBackground,
        },
        tickLabels: {
          padding: 8,
        },
      },
    },
    dependentAxis: {
      style: {
        axis: {
          stroke: theme.colors[variant],
        },
        grid: {
          display: 'none',
        },
        tickLabels: {
          padding: 4,
        },
        axisLabel: {
          fill: theme.colors[variant],
        },
      },
    },
    line: {
      style: {
        data: {
          stroke: theme.colors[variant],
          strokeWidth: 2,
        },
      },
    },
    scatter: {
      style: {
        data: {
          fill: theme.colors[variant],
        },
      },
    },
  };
};
