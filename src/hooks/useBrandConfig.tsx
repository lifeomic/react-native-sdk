import React from 'react';
import { BrandConfigContext } from '../components/BrandConfigProvider';

export const useBrandConfig = () => React.useContext(BrandConfigContext);
