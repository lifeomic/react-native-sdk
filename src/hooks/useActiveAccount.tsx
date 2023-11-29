import React from 'react';

export type ActiveAccountContextValue = {
  account: string;
};

const ActiveAccountContext = React.createContext<
  ActiveAccountContextValue | undefined
>(undefined);

export type ActiveAccountProviderProps = {
  children?: React.ReactNode;
  account: string;
};

export const ActiveAccountProvider = ({
  children,
  account,
}: ActiveAccountProviderProps) => {
  const memoized = React.useMemo(() => ({ account }), [account]);

  return (
    <ActiveAccountContext.Provider value={memoized}>
      {children}
    </ActiveAccountContext.Provider>
  );
};

export const useActiveAccount = () => {
  const value = React.useContext(ActiveAccountContext);
  if (!value) {
    throw new Error(
      'useActiveAccount must be used within a ActiveAccountContextProvider',
    );
  }
  return value;
};
