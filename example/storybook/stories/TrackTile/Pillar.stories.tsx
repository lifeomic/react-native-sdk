import React from 'react';
import { View, StyleSheet } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Pillar } from 'src/components/TrackTile/PillarsTile/Pillar';
import { action } from '@storybook/addon-actions';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  Tracker,
  TrackerValue,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from 'src/components/TrackTile/services/TrackTileService';
import { boolean } from '@storybook/addon-knobs';
import { Anchor, CheckCircle, PlusSquare } from '@lifeomic/chromicons-native';
import { StyleOverridesProvider } from 'src/components/TrackTile/styles';

const nutritionTracker: Tracker = {
  id: 'nutrition',
  account: 'accountid',
  name: 'nutrition',
  color: '#33C317',
  description: 'desc',
  icon: 'apple',
  lifePoints: 0,
  resourceType: 'Observation',
  code: 'code',
  system: TRACKER_PILLAR_CODE_SYSTEM,
  units: [
    {
      code: 'svg',
      system: 'system',
      default: true,
      display: 'svgs',
      target: 5,
      unit: 'svg',
    },
  ],
};

const valuesContext = {
  system: TRACKER_PILLAR_CODE_SYSTEM,
  codeBelow: TRACKER_PILLAR_CODE,
};

const InteractivePillar = () => {
  const useCustomIcons = boolean('Use Custom Icons', false);
  const isBarFilled = boolean('Goal Was Met', false);
  return (
    <View style={defaultStyles.pillarsTile}>
      <View style={defaultStyles.pillarsTileBackgroundContainer}>
        <StyleOverridesProvider
          value={{
            pillarIconGoalMet: {
              ...(boolean('Goal Met Icon Custom Color', false)
                ? { color: 'red' }
                : {}),
            },
            pillarIconGoalNotMet: {
              ...(boolean('Goal Not Met Icon Custom Color', false)
                ? { color: 'currentColor' }
                : {}),
            },
          }}
        >
          <Pillar
            trackerValues={[
              {
                id: 'trackerid',
                createdDate: new Date(),
                value: isBarFilled ? 5 : 0,
                code: { coding: [] },
              },
            ]}
            icons={
              useCustomIcons
                ? {
                    nutrition: Anchor,
                    'pillars-goal-met-icon': CheckCircle,
                    'pillars-add-data-button-icon': PlusSquare,
                  }
                : {}
            }
            tracker={nutritionTracker}
            onOpenDetails={action('onOpenDetails')}
            onError={action('onError')}
            onSaveNewValueOverride={action('onSaveNewValueOverride')}
            valuesContext={valuesContext}
          />
        </StyleOverridesProvider>
      </View>
    </View>
  );
};

const initialValue: TrackerValue = {
  id: 'trackerId',
  createdDate: new Date(),
  value: 0,
  code: { coding: [] },
};

storiesOf('Pillar', module)
  .addDecorator(MockEnvironmentDecorator())
  .add('default', () => <InteractivePillar />)
  .add('loading', () => (
    <View style={defaultStyles.pillarsTile}>
      <View style={defaultStyles.pillarsTileBackgroundContainer}>
        <Pillar
          trackerValues={[initialValue]}
          loading={true}
          tracker={nutritionTracker}
          onSaveNewValueOverride={action('onSaveNewValueOverride')}
          onOpenDetails={action('onOpenDetails')}
          valuesContext={valuesContext}
        />
      </View>
    </View>
  ))
  .add('full', () => (
    <View style={defaultStyles.pillarsTile}>
      <View style={defaultStyles.pillarsTileBackgroundContainer}>
        <Pillar
          trackerValues={[
            {
              ...initialValue,
              value: 5,
            },
          ]}
          tracker={nutritionTracker}
          onSaveNewValueOverride={action('onSaveNewValueOverride')}
          onOpenDetails={action('onOpenDetails')}
          valuesContext={valuesContext}
        />
      </View>
    </View>
  ));

const defaultStyles = StyleSheet.create({
  pillarsTile: {
    position: 'relative',
    borderRadius: 14,
    elevation: 1,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {
      height: 0,
      width: 2,
    },
    shadowRadius: 13,
  },
  pillarsTileBackgroundContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',
    height: 342,
    padding: 8,
    paddingVertical: 16,
    backgroundColor: '#222222',
  },
});
