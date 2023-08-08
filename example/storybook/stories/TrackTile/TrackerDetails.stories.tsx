import React from 'react';

import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { TrackerDetails } from '../../../../src/components/TrackTile/TrackerDetails/TrackerDetails';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  InstalledMetric,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
} from '../../../../src/components/TrackTile/services/TrackTileService';
import { t } from '../../../../lib/i18n';
import {
  boolean,
  withKnobs,
  object,
  date,
  select,
} from '@storybook/addon-knobs';
import { Anchor } from '@lifeomic/chromicons-native';
import {
  UnitPicker,
  UnitPickerProps,
} from '../../../../src/components/TrackTile/TrackerDetails/UnitPicker';
import {
  BrandConfigProvider,
  DeveloperConfigProvider,
  IconProvider,
} from '../../../../src';
import { SafeView } from '../../helpers/SafeView';
import BottleImage from './assets/bottle.png';

const referenceDate = date('Reference Date', undefined);

const defaultTracker = {
  id: 'id',
  metricId: 'metric-id',
  name: 'Example',
  color: '#5F9EA0',
  resourceType: 'Observation',
  description: t(
    'track-tile.example-description',
    'This is an example description for the track tile that is to be added',
  ),
  units: [
    {
      unit: 'unit-1',
      display: 'steps',
      target: 10,
      default: true,
    },
    {
      unit: 'unit-2',
      display: 'skips',
      target: 75,
    },
    {
      unit: 'unit-3',
      display: 'jumps',
      target: 50,
    },
  ],
  system: TRACKER_CODE_SYSTEM,
} as InstalledMetric;

const valuesContext = {
  system: TRACKER_CODE_SYSTEM,
  codeBelow: TRACKER_CODE,
};

storiesOf('TrackerDetails', module)
  .addDecorator(withKnobs)
  .addDecorator((storyFn, context) =>
    MockEnvironmentDecorator({
      trackers: [
        {
          id: '1',
          name: 'Test',
          color: 'chartreuse',
          system: TRACKER_CODE_SYSTEM,
        },
      ],
    })(storyFn, context),
  )
  .addDecorator((story) => <SafeView>{story()}</SafeView>)

  .add('default', () => {
    return (
      <IconProvider
        icons={
          boolean('Use Custom Icons', false)
            ? {
                id: Anchor,
              }
            : {}
        }
      >
        <TrackerDetails
          tracker={defaultTracker}
          valuesContext={valuesContext}
          referenceDate={new Date(referenceDate)}
          // NOTE: This should not be necessary in production apps where the referenceDate prop does not change on the fly.
          // https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
          key={referenceDate}
        />
      </IconProvider>
    );
  })

  .add('Image with Radial Progress', () => {
    return (
      <DeveloperConfigProvider
        developerConfig={{
          componentProps: {
            TrackerDetails: {
              showSimpleTargetMessage: boolean('showSimpleTargetMessage', true),
              dayPickerShowTodaysUnits: boolean(
                'dayPickerShowTodaysUnits',
                true,
              ),
              dayPickerDateFormat: select(
                'dayPickerDateFormat',
                {
                  'iiii, MMMM d': 'iiii, MMMM d',
                  'MMMM d': 'MMMM d',
                  'MMMM d, yyyy': 'MMMM d, yyyy',
                },
                'iiii, MMMM d',
              ),
              radialProgressStrokeLinecap: 'butt',
              radialProgressRadius: 100,
              radialProgressStrokeWidth: 15,
              radialProgressRotation: -90,
              metricOverrides: () => ({
                'metric-id': { image: BottleImage, color: 'red' },
              }),
            },
          },
        }}
      >
        <BrandConfigProvider
          styles={{
            TrackerDetails: {
              imageContainer: {
                height: 150,
                alignItems: 'center',
              },
              myTargetText: {
                color: 'black',
                fontSize: 26,
                lineHeight: 24,
                fontWeight: '700',
                paddingTop: 10,
                textTransform: 'capitalize',
              },
              trackAmountControlValueInputContainer: {
                marginTop: -10,
              },
              trackAmountControlValueLargeSizeText: {
                fontSize: 70,
              },
              trackAmountControlValueMediumSizeText: {
                fontSize: 40,
              },
              trackAmountControlValueSmallSizeText: {
                fontSize: 30,
              },
              radialProgressBorderView: {
                borderWidth: 2,
                opacity: 1,
                borderColor: 'black',
              },
              radialProgressContainer: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              imageProgressContainer: {
                height: 265,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              },
            },
          }}
        >
          <TrackerDetails
            tracker={defaultTracker}
            valuesContext={valuesContext}
            referenceDate={new Date(referenceDate)}
            key={referenceDate}
          />
        </BrandConfigProvider>
      </DeveloperConfigProvider>
    );
  })

  .add('UnitPicker', () => {
    const units: UnitPickerProps['units'] = object('units', [
      {
        code: 'c1',
        display: 'Unit 1',
        system: 's1',
        target: 1,
        unit: 'u1',
        default: true,
      },
      {
        code: 'c2',
        display: 'Unit 2',
        system: 's2',
        target: 2,
        unit: 'u2',
        default: false,
      },
    ]);

    return (
      <View style={{ alignItems: 'center' }}>
        <UnitPicker
          value="u1"
          units={units}
          onChange={() => console.log('changed')}
        />
        <UnitPicker
          value="u2"
          units={units}
          onChange={() => console.log('changed')}
        />
      </View>
    );
  });
