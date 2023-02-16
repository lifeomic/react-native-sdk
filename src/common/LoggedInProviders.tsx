import React from 'react';

import { ActiveAccountContextProvider } from '../hooks/useActiveAccount';

export const LoggedInProviders = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <ActiveAccountContextProvider>{children}</ActiveAccountContextProvider>
  );
};
