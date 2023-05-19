import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { object } from '@storybook/addon-knobs';
import { BrandConfigProvider, useIcons } from '../../../../src';
import { ThemeExampleScreen } from './ThemeExampleScreen';
import * as baseTheme from '../../../../src/components/BrandConfigProvider/theme/base';
import { ExampleBox, ExampleBoxStyles } from './ExampleBox';
import { BrandConfigProviderStyles } from '../../../../src/components/BrandConfigProvider/styles/types';
import { CenterView } from 'example/storybook/helpers/CenterView';
import Svg, { Path } from 'react-native-svg';
import { List } from 'react-native-paper';
import { Apple } from '@lifeomic/chromicons-native';

storiesOf('BrandConfigProvider', module)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)

  .add('Default Theme', () => {
    const customColors = object('theme.colors', baseTheme.colors);
    const customSpacing = object('theme.spacing', baseTheme.spacing);

    const theme = { colors: customColors, spacing: customSpacing };

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
  })

  .add('Icons', () => {
    function IconExample({ name }: { name: string }) {
      const { [name]: Icon } = useIcons();

      return <Icon />;
    }

    return (
      <BrandConfigProvider
        icons={{
          // Override the icon for apple
          Apple: () => (
            <Svg fill="slategray" height="24" width="24" viewBox="0 0 16 16">
              <Path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
              <Path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
            </Svg>
          ),
          // provide a brand new icon called Custom
          Custom: () => (
            <Svg height="24" width="24" viewBox="0 0 16 16">
              <Path d="M4.355.522a.5.5 0 0 1 .623.333l.291.956A4.979 4.979 0 0 1 8 1c1.007 0 1.946.298 2.731.811l.29-.956a.5.5 0 1 1 .957.29l-.41 1.352A4.985 4.985 0 0 1 13 6h.5a.5.5 0 0 0 .5-.5V5a.5.5 0 0 1 1 0v.5A1.5 1.5 0 0 1 13.5 7H13v1h1.5a.5.5 0 0 1 0 1H13v1h.5a1.5 1.5 0 0 1 1.5 1.5v.5a.5.5 0 1 1-1 0v-.5a.5.5 0 0 0-.5-.5H13a5 5 0 0 1-10 0h-.5a.5.5 0 0 0-.5.5v.5a.5.5 0 1 1-1 0v-.5A1.5 1.5 0 0 1 2.5 10H3V9H1.5a.5.5 0 0 1 0-1H3V7h-.5A1.5 1.5 0 0 1 1 5.5V5a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 .5.5H3c0-1.364.547-2.601 1.432-3.503l-.41-1.352a.5.5 0 0 1 .333-.623zM4 7v4a4 4 0 0 0 3.5 3.97V7H4zm4.5 0v7.97A4 4 0 0 0 12 11V7H8.5zM12 6a3.989 3.989 0 0 0-1.334-2.982A3.983 3.983 0 0 0 8 2a3.983 3.983 0 0 0-2.667 1.018A3.989 3.989 0 0 0 4 6h8z" />
            </Svg>
          ),
        }}
      >
        <List.Section style={{ width: 310 }}>
          <List.Item
            title='Provided "Out of the Box"'
            left={() => <IconExample name="AlertOctagon" />}
          />
          <List.Item
            title='Overrides the "Apple" Icon →'
            left={() => <IconExample name="Apple" />}
            right={() => <Apple />}
          />
          <List.Item
            title={'Completely custom icon'}
            left={() => <IconExample name="Custom" />}
          />
        </List.Section>
      </BrandConfigProvider>
    );
  });
