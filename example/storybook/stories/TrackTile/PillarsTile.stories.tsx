import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { PillarsTile } from 'src/components/TrackTile/PillarsTile/PillarsTile';
import { action } from '@storybook/addon-actions';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  Tracker,
  TRACKER_PILLAR_CODE_SYSTEM,
} from 'src/components/TrackTile/services/TrackTileService';
import { View } from 'react-native';
import { boolean } from '@storybook/addon-knobs';
import {
  Anchor,
  Smartphone,
  Camera,
  Planet,
  Aperture,
  CheckCircle,
  PlusSquare,
} from '@lifeomic/chromicons-native';
const baseTracker = {
  account: 'accountid',
  description: 'desc',
  lifePoints: 0,
  system: TRACKER_PILLAR_CODE_SYSTEM,
};

const nutritionPillar: Tracker = {
  ...baseTracker,
  id: 'nutrition',
  metricId: 'nutrition',
  name: 'nutrition',
  icon: 'apple',
  color: '#33C317',
  resourceType: 'Observation',
  code: 'code',
  order: 1,
  units: [
    {
      code: 'nutrition',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      default: true,
      display: 'svgs',
      target: 5,
      unit: 'svg',
    },
  ],
};
const activityPillar: Tracker = {
  ...baseTracker,
  id: 'activity',
  metricId: 'activity',
  name: 'activity',
  icon: 'running',
  color: '#CD335E',
  resourceType: 'Observation',
  code: 'activity',
  order: 2,
  units: [
    {
      code: 'activity',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 30,
      unit: 'min',
    },
  ],
};
const mindfulnessPillar: Tracker = {
  ...baseTracker,
  id: 'self-care',
  metricId: 'self-care',
  name: 'self care',
  icon: 'heart',
  color: '#EFC002',
  resourceType: 'Procedure',
  code: 'self-care',
  order: 3,
  units: [
    {
      code: 'self-care',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 15,
      unit: 'min',
    },
  ],
};
const sleepPillar: Tracker = {
  ...baseTracker,
  id: 'sleep',
  metricId: 'sleep',
  name: 'sleep',
  color: '#6956D0',
  icon: 'moon',
  resourceType: 'Procedure',
  code: 'code',
  order: 4,
  units: [
    {
      code: 'sleep',
      default: true,
      display: 'hrs',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 7,
      unit: 'hr',
    },
  ],
};
const schoolPillar: Tracker = {
  ...baseTracker,
  id: 'school',
  metricId: 'school',
  name: 'school',
  icon: 'book-open',
  resourceType: 'Procedure',
  code: 'school',
  color: '#00A7D4',
  order: 5,
  units: [
    {
      code: 'school',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 60,
      unit: 'min',
    },
  ],
};

storiesOf('PillarsTile', module)
  .addDecorator(
    MockEnvironmentDecorator({
      trackers: [
        nutritionPillar,
        activityPillar,
        mindfulnessPillar,
        sleepPillar,
        schoolPillar,
      ],
    }),
  )
  .add('default', () => (
    <PillarsTile
      onOpenDetails={action('onOpenDetails')}
      onSaveNewValueOverride={action('onSaveNewValueOverride')}
      icons={
        boolean('Use Custom Icons', false)
          ? {
              nutrition: Anchor,
              activity: Smartphone,
              'self-care': Camera,
              sleep: Planet,
              school: Aperture,
              'pillars-goal-met-icon': CheckCircle,
              'pillars-add-data-button-icon': PlusSquare,
            }
          : {}
      }
    />
  ))
  .add('Custom Background', () => (
    <PillarsTile
      onOpenDetails={action('onOpenDetails')}
      onSaveNewValueOverride={action('onSaveNewValueOverride')}
      background={
        <View
          style={{
            backgroundColor: '#E44572',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      }
    />
  ));
