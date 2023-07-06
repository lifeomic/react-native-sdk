import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { withKnobs } from '@storybook/addon-knobs';
import { MyDataScreen } from '../../../../src/screens/MyDataScreen';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';
import { eachDayOfInterval } from 'date-fns';
import { memoize, chunk } from 'lodash';
import { SafeView } from '../../helpers/SafeView';

const toPoint = (value: number, date: Date) => ({
  resource: {
    effectiveDateTime: date.toISOString(),
    valueQuantity: {
      value,
    },
  },
});

const toEntry = (...entry: any[]) => ({ entry });

const buildSampleDate = memoize(
  (_: string, dates: Date[]) =>
    toEntry(
      ...dates.map((date) => toPoint(Math.round(Math.random() * 10), date)),
    ),
  (id, dates) => `${id}-${dates.join(',')}`,
);

storiesOf('MyDataScreen', module)
  .addDecorator(withKnobs)
  .addDecorator(
    DataProviderDecorator((mock) => {
      mock.onGet().reply(() => [
        200,
        {
          homeTab: {
            myDataSettings: {
              components: [
                {
                  title: 'Resting Heart Rate and Weight',
                  trace1: {
                    type: 'Observation',
                    label: 'Weight',
                    coding: [
                      {
                        code: 'code1',
                        system: 'system1',
                      },
                    ],
                  },
                  trace2: {
                    type: 'Observation',
                    label: 'Resting Heart Rate',
                    coding: [
                      {
                        code: 'code2',
                        system: 'system1',
                      },
                    ],
                  },
                },
                {
                  title: 'Body Fat Percentage',
                  trace1: {
                    type: 'Observation',
                    label: 'Body Fat %',
                    coding: [
                      {
                        code: 'code3',
                        system: 'system1',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      ]);
      mock.onPost().reply((req) => {
        const data = JSON.parse(req.data);
        const start = new Date(data.date[0].slice(2));
        const end = new Date(data.date[1].slice(2));

        let dates = eachDayOfInterval({ start, end });

        if (dates.length > 31) {
          dates = chunk(dates, 12).map((d) => d[0]);
        }

        return [200, buildSampleDate(data.code, dates)];
      });
    }),
  )
  .add('default', () => {
    return (
      <SafeView>
        <MyDataScreen />
      </SafeView>
    );
  });
