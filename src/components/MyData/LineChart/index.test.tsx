import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { LineChart } from './index';
import { useChartData } from './useChartData';
import { addDays, startOfDay, format } from 'date-fns';

jest.mock('./useChartData', () => ({
  useChartData: jest.fn(),
}));

jest.mock('victory-native/src/components/victory-primitives/tspan', () => Text);
jest.mock('victory-bar/es', () => {
  const { Bar, ...barExports } = jest.requireActual('victory-bar/es');
  return {
    ...barExports,
    Bar: (props: any) => (
      <TouchableOpacity
        testID={`selection-${props.id}`}
        onPress={props.events?.onPress}
      >
        <Bar {...props} />
      </TouchableOpacity>
    ),
  };
});

const mockUseChartData = useChartData as any as jest.Mock;

const mockDate = startOfDay(new Date(0));
const mockDateLabel = format(mockDate, 'MMM dd');

describe('LineChart', () => {
  it('should render the chart', async () => {
    mockUseChartData.mockReturnValue({
      trace1Data: [{ x: Number(mockDate), y: 5 }],
      trace2Data: [],
    });

    const { findByText, findAllByText } = render(
      <LineChart
        dateRange={[mockDate, mockDate]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    expect(await findByText('Test Title')).toBeDefined();
    expect(await findAllByText('Trace1Label')).toHaveLength(2); // Legend & Axis
    expect(
      await findByText(format(addDays(mockDate, -1), 'MMM dd')),
    ).toBeDefined();
    expect(await findByText(format(mockDate, 'dd'))).toBeDefined();
    expect(await findByText(format(addDays(mockDate, 1), 'dd'))).toBeDefined();
  });

  it('should render the chart with second trace when supplied', async () => {
    mockUseChartData.mockReturnValue({
      trace1Data: [{ x: Number(mockDate), y: 5 }],
      trace2Data: [{ x: Number(mockDate), y: 6 }],
    });

    const { findAllByText } = render(
      <LineChart
        dateRange={[mockDate, mockDate]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
        trace2={{
          type: 'Observation',
          label: 'Trace2Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    expect(await findAllByText('Trace2Label')).toHaveLength(2); // Legend & Axis
  });

  it('should render the chart without trace if data is empty', async () => {
    mockUseChartData.mockReturnValue({
      trace1Data: [],
      trace2Data: [],
    });

    const { findByText } = render(
      <LineChart
        dateRange={[mockDate, mockDate]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    expect(await findByText('Trace1Label')).toBeDefined(); // Legend Only
  });

  it('should allow selecting the data to see details', async () => {
    mockUseChartData.mockReturnValue({
      trace1Data: [{ x: Number(mockDate), y: 5 }],
      trace2Data: [],
    });

    const { getByTestId } = render(
      <LineChart
        dateRange={[mockDate, mockDate]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    fireEvent.press(await getByTestId('selection-bar-data-0'));

    expect(await getByTestId(`${mockDateLabel}-5`)).toBeDefined();
  });

  it('should allow selecting data details and display two points of data', async () => {
    mockUseChartData.mockReturnValue({
      trace1Data: [
        { x: Number(mockDate), y: 5 },
        { x: Number(addDays(mockDate, 1)), y: 10 },
      ],
      trace2Data: [{ x: Number(mockDate), y: 6 }],
    });

    const { getByTestId } = render(
      <LineChart
        dateRange={[mockDate, addDays(mockDate, 3)]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
        trace2={{
          type: 'Observation',
          label: 'Trace2Label',
          code: {
            code: 'c2',
            system: 's',
          },
        }}
      />,
    );

    fireEvent.press(await getByTestId('selection-bar-data-0'));

    expect(await getByTestId(`${mockDateLabel}-5-6`)).toBeDefined();
  });

  it('can deselect data details', async () => {
    mockUseChartData.mockReturnValue({
      trace1Data: [{ x: Number(mockDate), y: 5 }],
      trace2Data: [],
    });

    const { getByTestId, queryByTestId } = render(
      <LineChart
        dateRange={[mockDate, addDays(mockDate, 2)]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    fireEvent.press(await getByTestId('selection-bar-data-0'));

    expect(await getByTestId(`${mockDateLabel}-5`)).toBeDefined();

    fireEvent.press(await getByTestId('selection-bar-data-1'));

    expect(await queryByTestId(`${mockDateLabel}-5`)).toBeNull();
  });
});
