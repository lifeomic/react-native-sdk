import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Anchor } from '@lifeomic/chromicons-native';
import { Tracker } from 'src/components/TrackTile/TrackerRow/Tracker';
import { Tracker as TrackerType } from 'src/components/TrackTile/main';
import { View } from 'react-native';
import TileBackground from 'src/components/TrackTile/TileBackground';
import {
  withKnobs,
  color,
  select,
  number,
  text,
  boolean,
} from '@storybook/addon-knobs';
import { StyleOverridesProvider } from 'src/components/TrackTile/styles';

storiesOf('Tracker', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const unit = text('unit', 'ounces');
    return (
      <StyleOverridesProvider
        value={{
          trackerCircleBorder: {
            backgroundColor: color('Tracker Circle Background', 'transparent'),
          },
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <TileBackground />
          <Tracker
            value={number('value', 7)}
            icons={
              boolean('Use Custom Icons', false)
                ? {
                    id: Anchor,
                  }
                : {}
            }
            {...({
              ...(boolean('installed', true) ? { metricId: '1' } : {}),
              color: color('color', '#0096E1'),
              icon: select(
                'icon',
                ['mindful', 'protein', 'running', 'water', 'default'],
                'water',
              ),
              metricId: 'id',
              target: number('target', 10),
              name: text('name', 'Water'),
              unit: text('unit', 'ounces'),
              units: [
                {
                  unit,
                  display: unit,
                },
              ],
            } as Partial<TrackerType> as any)}
          />
        </View>
      </StyleOverridesProvider>
    );
  });
