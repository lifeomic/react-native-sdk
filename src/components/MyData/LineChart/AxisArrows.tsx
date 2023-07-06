import React from 'react';
import { Path } from 'react-native-svg';
import { useCommonChartProps } from '../useCommonChartProps';
import { BlockProps } from 'victory-core';
import { useTheme } from '../../../hooks';
import { Trace } from './TraceLine';
import { useVictoryTheme } from '../useVictoryTheme';

type Props = {
  trace1: Trace;
  trace2?: Trace;
};
export const AxisArrows = ({ trace1, trace2 }: Props) => {
  const theme = useTheme();
  const commonProps = useCommonChartProps();
  const trace1Theme = useVictoryTheme(trace1, 'trace1');
  const trace2Theme = useVictoryTheme(trace2, 'trace2');

  const width = commonProps.width ?? 0;
  const height = commonProps.height ?? 0;
  const padding: Required<BlockProps> = new Proxy({} as any, {
    get(_, key: keyof BlockProps) {
      if (typeof commonProps.padding === 'number') return commonProps.padding;

      return commonProps.padding?.[key] ?? 50;
    },
  });

  return (
    <>
      <Path
        d={`M ${padding.left} ${padding.top} m -3 4 l 3 -4 l 3 4`}
        fill="transparent"
        stroke={toColor(
          trace1Theme.dependentAxis?.style?.axis?.stroke,
          theme.colors.primary,
        )}
        strokeWidth={1}
        strokeLinecap="round"
      />

      {!!trace2 && (
        <Path
          d={`M ${width - padding.right} ${padding.top} m -3 4 l 3 -4 l 3 4`}
          fill="transparent"
          stroke={toColor(
            trace2Theme.dependentAxis?.style?.axis?.stroke,
            theme.colors.primary,
          )}
          strokeWidth={1}
          strokeLinecap="round"
        />
      )}

      <Path
        d={`M ${width - padding.right} ${
          height - padding.bottom
        }  m -4 -3 l 4 3 l -4 3`}
        fill="transparent"
        stroke={toColor(
          trace1Theme.independentAxis?.style?.axis?.stroke,
          theme.colors.onBackground,
        )}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </>
  );
};

const toColor = (possibleColor: unknown, fallbackColor: string) => {
  if (typeof possibleColor === 'string') {
    return possibleColor;
  }

  return fallbackColor;
};
