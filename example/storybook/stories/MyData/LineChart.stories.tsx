import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import { LineChart } from '../../../../src/components/MyData/LineChart';
import { DataProviderDecorator } from '../../helpers/DataProviderDecorator';
import { addDays, eachDayOfInterval } from 'date-fns';
import { CenterView } from '../../helpers/CenterView';
import { memoize, chunk } from 'lodash';

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

storiesOf('LineChart', module)
  .addDecorator(withKnobs)
  .addDecorator(
    DataProviderDecorator((mock) => {
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
    const hasSecondTrace = boolean('Enable Trace 2', false);
    const hasTrendLine = boolean('Enable Trend Line', false);

    return (
      <CenterView>
        <LineChart
          title="Example Chart"
          padding={34}
          dateRange={{
            start: addDays(
              new Date(),
              -select('Number of Days', [1, 31, 365], 31) + 1,
            ),
            end: new Date(),
          }}
          trace1={{
            type: 'Observation',
            label: 'Trace 1',
            coding: [
              {
                code: 'code1',
                system: 'system1',
              },
            ],
            showTrend: hasTrendLine,
          }}
          trace2={
            hasSecondTrace
              ? {
                  type: 'Observation',
                  label: 'Trace 2',
                  coding: [
                    {
                      code: 'code2',
                      system: 'system1',
                    },
                  ],
                  showTrend: hasTrendLine,
                }
              : undefined
          }
        />
      </CenterView>
    );
  });
