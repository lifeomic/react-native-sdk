import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { AdvancedTrackerEditor } from '../../../../src/components/TrackTile/TrackerDetails/AdvancedTrackerEditor/AdvancedTrackerEditor';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  Code,
  Tracker,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from '../../../../src/components/TrackTile/services/TrackTileService';
import { nutrition, activity, mindful, sleep } from './util/ontologies';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import {
  HeaderButton,
  HeaderButtons,
  Item,
} from 'react-navigation-header-buttons';
import { notifySaveEditTrackerValue } from '../../../../src/components/TrackTile/services/EmitterService';
import { View } from 'react-native';

const ontology = {} as any;

const Stack = createNativeStackNavigator();

storiesOf('AdvancedTrackerEditor', module)
  .addDecorator(withKnobs)
  .addDecorator(
    MockEnvironmentDecorator({
      ontology,
    }),
  )
  .add('default', () => {
    const pillarType = select(
      'Pillar Type',
      ['Healthy Plants', 'Activity', 'Mindfulness', 'Sleep'],
      'Healthy Plants',
    );

    const fullDetails = boolean('Use full coding selection?', false);

    Object.assign(ontology, nutrition);
    let color = '#33C317';
    let displayOne = '{{count}} Serving';
    let stepAmount = 0.5;
    let resourceType: Tracker['resourceType'] = 'Observation';
    const codes: Code[] = [];

    switch (pillarType) {
      case 'Healthy Plants': {
        color = '#33C317';
        displayOne = '{{count}} Serving';
        stepAmount = 0.5;
        resourceType = 'Observation';
        Object.assign(ontology, nutrition);
        codes.push(
          ...(fullDetails
            ? [
                {
                  id: '14b53f07-d7cd-43f0-9780-75cd741b887a',
                  code: 'd6aeee97-7600-447f-bfb3-e77e10131807',
                  display: 'Grape',
                  system: 'http://lifeomic.com/fhir/nutrition',
                },
                {
                  id: '88b53f07-d5dc-49de-a61c-927f2b205aaa',
                  code: 'ab23392e-744c-41e2-a1a2-d53b22d80b0e',
                  display: 'Other Fruits',
                  system: 'http://lifeomic.com/fhir/nutrition',
                },
                {
                  id: '88b53f07-d5dc-49de-a61c-927f2b205aaa',
                  code: 'ab23392e-744c-41e2-a1a2-d53b22d80b0e',
                  display: 'Other Fruits',
                  system: 'http://lifeomic.com/fhir/nutrition',
                },
              ]
            : []),
          {
            code: '31b998e7-38d4-4ea0-8ec2-b5be9d8f1df6',
            display: 'Fruits',
            system: 'http://lifeomic.com/fhir/nutrition',
          },
        );
        break;
      }
      case 'Activity': {
        color = '#CD335E';
        displayOne = '{{count}} Minute';
        stepAmount = 5;
        resourceType = 'Procedure';
        Object.assign(ontology, activity);
        if (fullDetails) {
          codes.push(
            {
              id: '34b4febf-f342-b84c-d960-0d059bf0f5e8',
              code: '002',
              system: 'http://lifeomic.com/fhir/activity',
              display: 'Running',
            },
            {
              code: '008',
              display: 'Cardio',
              system: 'http://lifeomic.com/fhir/activity',
            },
          );
        }
        break;
      }
      case 'Mindfulness': {
        color = '#EFC002';
        displayOne = '{{count}} Minute';
        stepAmount = 5;
        resourceType = 'Procedure';
        Object.assign(ontology, mindful);
        codes.push({
          code: '007',
          system: 'http://lifeomic.com/fhir/activity',
          display: 'Breathing',
        });
        break;
      }
      case 'Sleep': {
        color = '#6956D0';
        displayOne = '{{count}} Hour';
        stepAmount = 15;
        resourceType = 'Procedure';
        Object.assign(ontology, sleep);
        break;
      }
    }

    codes.push({
      code: TRACKER_PILLAR_CODE,
      display: pillarType,
      system: TRACKER_PILLAR_CODE_SYSTEM,
    });

    const ScreenComponent = () => (
      <View style={{ backgroundColor: 'white' }}>
        <AdvancedTrackerEditor
          trackerValue={{
            code: {
              coding: [...codes],
            },
            createdDate: new Date(),
            id: 'some-id',
            value: resourceType === 'Procedure' ? stepAmount * 60 : 1,
          }}
          valuesContext={{
            codeBelow: TRACKER_PILLAR_CODE,
            system: TRACKER_PILLAR_CODE_SYSTEM,
          }}
          tracker={
            {
              code: TRACKER_PILLAR_CODE,
              color,
              system: TRACKER_PILLAR_CODE_SYSTEM,
              resourceType,
              units: [
                {
                  unit: 'unit-1',
                  display: 'svgs',
                  target: 5,
                  default: true,
                  displayOne,
                  stepAmount,
                },
              ],
            } as Partial<Tracker> as any
          }
        />
      </View>
    );

    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Demo"
            options={{
              title: `Edit ${
                resourceType === 'Observation'
                  ? displayOne.replace('{{count}} ', '')
                  : pillarType
              }`,

              headerRight: () => (
                <HeaderButtons
                  HeaderButtonComponent={(props) => (
                    <HeaderButton {...props} color={'#02BFF1'} />
                  )}
                >
                  <Item
                    title="Save"
                    onPress={async () => {
                      const value = await new Promise(
                        notifySaveEditTrackerValue,
                      );

                      alert(`Saved!\nNew Tracker Value: ${value?.value}`);
                    }}
                  />
                </HeaderButtons>
              ),

              headerLeft: () => (
                <HeaderButtons
                  HeaderButtonComponent={(props) => (
                    <HeaderButton {...props} color={'#02BFF1'} />
                  )}
                >
                  <Item title="Cancel" onPress={() => alert('Go Back')} />
                </HeaderButtons>
              ),
            }}
            component={ScreenComponent}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  });
