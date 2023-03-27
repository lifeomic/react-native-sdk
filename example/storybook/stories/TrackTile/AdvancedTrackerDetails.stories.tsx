import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { AdvancedTrackerDetails } from 'src/components/TrackTile/TrackerDetails/AdvancedTrackerDetails/AdvancedTrackerDetails';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  Tracker,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from 'src/components/TrackTile/services/TrackTileService';
import { select, withKnobs } from '@storybook/addon-knobs';
import { activity, mindful, nutrition, sleep } from './util/ontologies';

const ontology = {} as any;

storiesOf('AdvancedTrackerDetails', module)
  .addDecorator(withKnobs)
  .addDecorator(MockEnvironmentDecorator({ ontology }))
  .add('default', () => {
    const pillarType = select(
      'Pillar Type',
      ['Healthy Plants', 'Activity', 'Mindfulness', 'Sleep'],
      'Healthy Plants',
    );

    Object.assign(ontology, nutrition);
    let color = '#33C317';
    let displayOne = '{{count}} Serving';
    let displayOther = '{{count}} Servings';
    let quickAddAmount = 1;
    let target = 5;
    let resourceType: Tracker['resourceType'] = 'Observation';

    switch (pillarType) {
      case 'Healthy Plants': {
        color = '#33C317';
        displayOne = '{{count}} Serving';
        displayOne = '{{count}} Servings';
        target = 5;
        quickAddAmount = 1;
        resourceType = 'Observation';
        Object.assign(ontology, nutrition);
        break;
      }
      case 'Activity': {
        color = '#CD335E';
        displayOne = '{{count}} Minute';
        displayOther = '{{count}} Minutes';
        target = 30;
        quickAddAmount = 10;
        resourceType = 'Procedure';
        Object.assign(ontology, activity);
        break;
      }
      case 'Mindfulness': {
        color = '#EFC002';
        displayOne = '{{count}} Minute';
        displayOther = '{{count}} Minutes';
        target = 20;
        quickAddAmount = 10;
        resourceType = 'Procedure';
        Object.assign(ontology, mindful);
        break;
      }
      case 'Sleep': {
        color = '#6956D0';
        displayOne = '{{count}} Hour';
        displayOther = '{{count}} Hours';
        target = 7;
        quickAddAmount = 8;
        resourceType = 'Procedure';
        Object.assign(ontology, sleep);
        break;
      }
    }

    return (
      <AdvancedTrackerDetails
        onEditValue={(value) => {
          console.log('Edit Value Clicked with value', value);
        }}
        icons={
          new Proxy(
            {
              Fruits:
                'https://cdn.pixabay.com/photo/2016/11/30/01/44/fruit-1871714_1280.jpg',
              Vegetables:
                'https://cdn.pixabay.com/photo/2016/03/05/19/02/vegetables-1238252_1280.jpg',
              'Nuts/Seeds/Oils':
                'https://cdn.pixabay.com/photo/2017/08/19/08/42/olive-2657696_1280.jpg',
              Cardio:
                'https://cdn.pixabay.com/photo/2017/05/25/15/08/jogging-2343558_1280.jpg',
              'Flexibility & Balance':
                'https://cdn.pixabay.com/photo/2016/09/21/23/59/sport-1686064_1280.jpg',
              HIIT: 'https://cdn.pixabay.com/photo/2017/03/13/20/02/tyre-push-2140997_1280.jpg',
              'Strength Training':
                'https://cdn.pixabay.com/photo/2016/08/31/22/22/break-1634767_1280.jpg',
              Breathing:
                'https://cdn.pixabay.com/photo/2021/12/28/14/37/flower-6899466_1280.jpg',
              Meditating:
                'https://cdn.pixabay.com/photo/2020/08/31/20/19/zen-5533494_1280.jpg',
              'Mindful Yoga':
                'https://cdn.pixabay.com/photo/2015/09/14/23/28/yoga-940359_1280.jpg',
              Prayer:
                'https://cdn.pixabay.com/photo/2014/11/15/13/57/tiffany-531992_1280.jpg',
              Sleep:
                'https://www.copiaguekiwanis.org/x/cdn/?https://images.unsplash.com/photo-1501621812608-efe6f4a3af60?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjU1MTN9&s=c9713e93f937587074ed61a670623193',
            },
            {
              get: (v: any, p: any) =>
                v[p] ? { uri: v[p] } : require('./assets/icon.png'),
            },
          )
        }
        tracker={
          {
            id: '2',
            name: pillarType,
            code: 'pillar-code',
            color,
            system: TRACKER_PILLAR_CODE_SYSTEM,
            resourceType,
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
            target,
            units: [
              {
                unit: 'unit-1',
                display: 'svgs',
                target,
                default: true,
                displayOne,
                displayOther,
                quickAddAmount,
              },
            ],
          } as Partial<Tracker> as any
        }
        valuesContext={{
          system: TRACKER_PILLAR_CODE_SYSTEM,
          codeBelow: TRACKER_PILLAR_CODE,
        }}
      />
    );
  });
