import React from 'react';

import { storiesOf } from '@storybook/react-native';
import Indicator, {
  aliases,
} from '../../../../src/components/TrackTile/icons/indicator';
import * as Icons from '@lifeomic/chromicons-native';
import { kebabCase, invert } from 'lodash';
import { View, Text, ScrollView } from 'react-native';
import { CenterView } from '../../helpers/CenterView';

storiesOf('Indicator', module)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('default', () => {
    const names = Object.keys(Icons).map(kebabCase);

    return (
      <ScrollView
        style={{ paddingHorizontal: 10 }}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
      >
        {names.map((name) => {
          const alias = invert(aliases)[name];
          return (
            <View
              key={name}
              style={{
                width: '33%',
                alignItems: 'center',
                height: 60,
              }}
            >
              <Indicator name={name} />
              <Text>{name}</Text>
              {alias && <Text>{`(${alias})`}</Text>}
            </View>
          );
        })}
      </ScrollView>
    );
  });
