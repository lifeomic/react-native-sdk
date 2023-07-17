import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { PointBreakdown, createPointBreakdown } from './point-breakdown';
import { startOfDay, format, endOfDay, addDays } from 'date-fns';

const mockDate = startOfDay(new Date(0));
const mockDateLabel = format(mockDate, 'MMMM dd, yyyy');

describe('PointBreakdown', () => {
  it('should render the component', async () => {
    const date2 = addDays(mockDate, 1);
    const { getByText } = render(
      <PointBreakdown
        dataUri=""
        dateRange={[mockDate, endOfDay(mockDate)]}
        onLoad={jest.fn()}
        selectedPoints={[
          {
            x: +mockDate,
            y: 10,
            size: 1,
            trace: {
              label: 'Label 1',
              coding: [],
              type: 'Observation',
            },
          },
          {
            x: +date2,
            y: 12,
            size: 1,
            trace: {
              label: 'Label 2',
              coding: [],
              type: 'Observation',
            },
          },
        ]}
        title="Title"
      />,
    );

    expect(await getByText('Title')).toBeDefined();
    expect(await getByText(mockDateLabel)).toBeDefined();
    expect(await getByText(format(mockDate, 'MMM dd:'))).toBeDefined();
    expect(await getByText('10')).toBeDefined();
    expect(await getByText('Label 1')).toBeDefined();
    expect(await getByText(format(date2, 'MMM dd:'))).toBeDefined();
    expect(await getByText('12')).toBeDefined();
    expect(await getByText('Label 2')).toBeDefined();
  });

  it('should render the component with a multi day range', async () => {
    const start = mockDate;
    const end = addDays(endOfDay(mockDate), 3);
    const { getByText } = render(
      <PointBreakdown
        dataUri=""
        dateRange={[start, end]}
        onLoad={jest.fn()}
        selectedPoints={[
          {
            x: +mockDate,
            y: 10,
            size: 1,
            trace: {} as any,
          },
        ]}
        title="Title"
      />,
    );

    expect(
      await getByText(`${format(start, 'MMMM dd')}-${format(end, 'dd, yyyy')}`),
    ).toBeDefined();
  });

  it('should render the component with a custom footer', async () => {
    const CustomPointBreakDown = createPointBreakdown({
      Footer: <Text>Custom Footer</Text>,
    });
    const { getByText } = render(
      <CustomPointBreakDown
        dataUri=""
        dateRange={[mockDate, endOfDay(mockDate)]}
        onLoad={jest.fn()}
        selectedPoints={[]}
        title="Title"
      />,
    );

    expect(await getByText('Custom Footer')).toBeDefined();
  });
});
