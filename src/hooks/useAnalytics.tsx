import React, { createContext, useContext } from 'react';

export type AnalyticsEvent = {
  user: any;
  type: string;
  [k: string]: any;
};

type AnalyticsEventConsumer = {
  onEvent: (event: AnalyticsEvent) => void;
};

export interface Analytics {
  emit: (event: AnalyticsEvent) => void;
}

const AnalyticsContext = createContext<Analytics>({
  emit: () => Promise.reject(),
});

type Props = {
  consumers: AnalyticsEventConsumer[];
  children?: React.ReactNode;
};

export const AnalyticsContextProvider = ({ consumers, children }: Props) => {
  const emit = (event: AnalyticsEvent) => {
    for (const consumer of consumers) {
      consumer.onEvent(event);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ emit }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
