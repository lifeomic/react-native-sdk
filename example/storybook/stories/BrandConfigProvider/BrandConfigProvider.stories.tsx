import React from 'react';

import { View, ViewStyle } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { object } from '@storybook/addon-knobs';
import { BrandConfigProvider, Theme } from 'src';
import { ThemeExampleScreen } from './ThemeExampleScreen';
import * as baseTheme from 'src/components/BrandConfigProvider/theme/base';
import { ExampleBox, ExampleBoxStyles } from './ExampleBox';
import { BrandConfigProviderStyles } from 'src/components/BrandConfigProvider/types';

storiesOf('BrandConfigProvider', module)
  .addDecorator((story) => <View style={centerView}>{story()}</View>)

  .add('Default Theme', () => {
    const customColors = object('theme.colors', baseTheme.colors);
    const customSpacing = object('theme.spacing', baseTheme.spacing);

    const theme = new Theme({ colors: customColors, spacing: customSpacing });

    return (
      <BrandConfigProvider theme={theme}>
        <ThemeExampleScreen />
      </BrandConfigProvider>
    );
  })

  .add('Style', () => {
    const providerStyles: BrandConfigProviderStyles = object(
      'Provider level component styles',
      {
        ExampleBox: {
          container: {
            borderWidth: 4,
          },
          text: {
            fontWeight: 'bold',
          },
        },
      },
    );
    const componentStyles: ExampleBoxStyles = object('Component level styles', {
      container: {
        borderColor: 'blue',
      },
      text: {
        fontStyle: 'italic',
      },
    });

    return (
      <BrandConfigProvider styles={providerStyles}>
        <ExampleBox message="Text inside a box" styles={componentStyles} />
      </BrandConfigProvider>
    );
  });

const centerView: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};
