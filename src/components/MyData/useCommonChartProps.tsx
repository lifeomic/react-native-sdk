import React from 'react';

import { VictoryCommonProps, BlockProps } from 'victory-core';

type ChartProps = VictoryCommonProps & {
  padding: Required<BlockProps>;
  width: number;
  height: number;
};

const CommonChartPropsContext = React.createContext<ChartProps>({
  height: 0,
  width: 0,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

type Props = ChartProps & { children: React.ReactNode };

export const CommonChartPropsProvider = ({ children, ...props }: Props) => (
  <CommonChartPropsContext.Provider value={props}>
    {children}
  </CommonChartPropsContext.Provider>
);

export const useCommonChartProps = () =>
  React.useContext(CommonChartPropsContext);
