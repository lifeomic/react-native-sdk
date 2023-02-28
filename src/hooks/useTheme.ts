import React from 'react';
import { ThemeContext } from '../components/BrandConfigProvider/theme/ThemeProvider';

export const useTheme = () => React.useContext(ThemeContext);
