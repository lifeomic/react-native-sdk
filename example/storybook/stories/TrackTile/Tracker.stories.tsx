import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Anchor } from '@lifeomic/chromicons-native';
import { Tracker } from '../../../../src/components/TrackTile/TrackerRow/Tracker';
import { Tracker as TrackerType } from '../../../../src/components/TrackTile/main';
import { View } from 'react-native';
import {
  withKnobs,
  color,
  select,
  number,
  text,
  boolean,
} from '@storybook/addon-knobs';
import { CenterView } from '../../helpers/CenterView';

storiesOf('Tracker', module)
  .addDecorator(withKnobs)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => {
    const unit = text('unit', 'ounces');
    return (
      <View style={{ alignItems: 'center' }}>
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
    );
  });
