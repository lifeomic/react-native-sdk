import * as React from 'react';
import { DeveloperConfig } from 'src/common/DeveloperConfig';

// NOTE: An empty object should always be the default, so that
// DeveloperConfigProvider doesn't _have_ to be present.  This
// means all props must be optional.
export const DeveloperConfigContext = React.createContext<DeveloperConfig>({});

interface Props {
  developerConfig: DeveloperConfig;
  children: React.ReactNode;
}

export function DeveloperConfigProvider({ developerConfig, children }: Props) {
  return (
    <DeveloperConfigContext.Provider value={developerConfig}>
      {children}
    </DeveloperConfigContext.Provider>
  );
}
