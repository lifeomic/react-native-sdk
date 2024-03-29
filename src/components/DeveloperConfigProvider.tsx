import * as React from 'react';
import { DeveloperConfig } from '../common/DeveloperConfig';
import { ThemeProp } from './BrandConfigProvider';
import { generateColors } from './BrandConfigProvider/theme/generateColors';

export type ExpandedDeveloperConfig = DeveloperConfig & {
  theme?: ThemeProp;
};

// NOTE: An empty object should always be the default, so that
// DeveloperConfigProvider doesn't _have_ to be present.  This
// means all props must be optional.
export const DeveloperConfigContext =
  React.createContext<ExpandedDeveloperConfig>({});

interface Props {
  developerConfig: DeveloperConfig;
  children: React.ReactNode;
}

export function DeveloperConfigProvider({ developerConfig, children }: Props) {
  const expandedDevConfig: ExpandedDeveloperConfig = developerConfig;

  // simpleTheme expansion to theme prop
  if (developerConfig.simpleTheme) {
    const { primaryColor } = developerConfig.simpleTheme;
    const colors = generateColors(primaryColor);
    expandedDevConfig.theme = {
      colors,
    };
  }

  return (
    <DeveloperConfigContext.Provider value={expandedDevConfig}>
      {children}
    </DeveloperConfigContext.Provider>
  );
}
