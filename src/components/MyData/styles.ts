import { StyleSheet } from 'react-native';
import { VictoryThemeDefinition } from 'victory-core';
import { createStyles } from '../BrandConfigProvider';

type StyleExtractor<T> = T extends { style: unknown } ? T['style'] : never;
type VictoryStyleProp<K extends keyof VictoryThemeDefinition> = StyleExtractor<
  Required<Required<VictoryThemeDefinition>[K]>
>;

export const defaultChartStyles = createStyles('ChartStyles', (theme) => ({
  independentAxis: {
    grid: {
      strokeDasharray: '0 2 0',
      stroke: theme.colors.outline,
    },
    axis: {
      stroke: theme.colors.onBackground,
    },
    tickLabels: {
      padding: 8,
      fill: theme.colors.onBackground,
    },
  } as VictoryStyleProp<'axis'>,
  dependentAxis: {
    grid: {
      display: 'none',
    },
    tickLabels: {
      padding: 4,
    },
  } as VictoryStyleProp<'dependentAxis'>,
  line: {
    data: {
      strokeWidth: 2,
    },
  } as VictoryStyleProp<'line'>,
  scatter: {} as VictoryStyleProp<'scatter'>,
  dataSelectionTooltip: {
    line: {
      strokeWidth: 1,
      stroke: theme.colors.onBackground,
    },
    offsetX: -12,
    offsetY: -25,
    width: 109,
    height: 30,
    stroke: theme.colors.border,
    fill: theme.colors.primaryContainer,
    strokeWidth: StyleSheet.hairlineWidth,
    dateTextColor: theme.colors.onPrimaryContainer,
    bubble1TextColor: theme.colors.onPrimary,
    bubble2TextColor: theme.colors.onSecondary,
  },
  colors: {
    trace1: theme.colors.primary,
    trace2: theme.colors.secondary,
  },
  chart: {
    height: undefined as number | undefined,
    width: undefined as number | undefined,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultChartStyles> {}
}

export type LogoHeaderStyles = NamedStylesProp<typeof defaultChartStyles>;
