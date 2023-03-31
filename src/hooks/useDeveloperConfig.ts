import React from 'react';
import { DeveloperConfigContext } from '../components/DeveloperConfigProvider';

export const useDeveloperConfig = () =>
  React.useContext(DeveloperConfigContext);
