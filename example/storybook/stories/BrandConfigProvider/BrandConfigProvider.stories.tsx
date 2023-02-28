import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { BrandConfigProvider, Theme } from 'src';
import { ThemeExampleScreen } from './ThemeExampleScreen';
import * as baseTheme from 'src/components/BrandConfigProvider/theme/base';

import { object, color } from '@storybook/addon-knobs';

storiesOf('BrandConfigProvider', module)
  .add('Basic Theme Colors', () => {
    const customColors: Record<string, string> = {};
    Object.entries(baseTheme.colors).forEach(([key, value]) => {
      customColors[key] = color(key, value);
    });

    const theme = new Theme({ colors: customColors });

    return (
      <BrandConfigProvider theme={theme}>
        <ThemeExampleScreen />
      </BrandConfigProvider>
    );
  })
  .add('Default Theme', () => {
    const customColors = object('theme.colors', baseTheme.colors);
    const customSpacing = object('theme.spacing', baseTheme.spacing);

    const theme = new Theme({ colors: customColors, spacing: customSpacing });

    return (
      <BrandConfigProvider theme={theme}>
        <ThemeExampleScreen />
      </BrandConfigProvider>
    );
  });
