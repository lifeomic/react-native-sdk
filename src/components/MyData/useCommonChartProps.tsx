import React from 'react';

import { VictoryCommonProps } from 'victory-core';

const CommonChartPropsContext = React.createContext<VictoryCommonProps>({});

type Props = VictoryCommonProps & { children: React.ReactNode };

export const CommonChartPropsProvider = ({ children, ...props }: Props) => (
  <CommonChartPropsContext.Provider value={props}>
    {children}
  </CommonChartPropsContext.Provider>
);

export const useCommonChartProps = () =>
  React.useContext(CommonChartPropsContext);
