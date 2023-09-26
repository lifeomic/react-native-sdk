import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Chart } from '../../../../src/components/TrackTile/TrackerDetails/TrackerHistoryChart/Chart';
import { View } from 'react-native';
import { endOfToday, subDays, startOfToday } from 'date-fns';

const defaultProps = {
  target: 5,
  values: [3, 4, 5, 5, 1, 4, 0],
  range: {
    start: subDays(startOfToday(), 6),
    end: endOfToday(),
  },
};

storiesOf('TrackTile/Tracker History Chart', module)
  .addDecorator((Story) => (
    <View style={{ marginHorizontal: 34, marginVertical: 128, height: 250 }}>
      {Story()}
    </View>
  ))
  .add('default', () => <Chart {...defaultProps} />)
  .add('loading', () => <Chart {...defaultProps} loading />)
  .add('error', () => <Chart {...defaultProps} values={[]} hasError />);
