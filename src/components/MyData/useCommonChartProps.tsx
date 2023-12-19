import React from 'react';

import { VictoryCommonProps, BlockProps } from 'victory-core';

type ChartProps = VictoryCommonProps & {
  padding: Required<BlockProps>;
  width: number;
  height: number;
  plotAreaWidth: number;
  plotAreaHeight: number;
};

const CommonChartPropsContext = React.createContext<ChartProps>({
  height: 0,
  width: 0,
  plotAreaWidth: 0,
  plotAreaHeight: 0,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

type Props = Omit<ChartProps, 'plotAreaWidth' | 'plotAreaHeight'> & {
  children: React.ReactNode;
};

export const CommonChartPropsProvider = ({ children, ...props }: Props) => (
  <CommonChartPropsContext.Provider
    value={{
      ...props,
      plotAreaWidth: props.width - props.padding.left - props.padding.right,
      plotAreaHeight: props.height - props.padding.top - props.padding.bottom,
    }}
  >
    {children}
  </CommonChartPropsContext.Provider>
);

export const useCommonChartProps = () =>
  React.useContext(CommonChartPropsContext);
