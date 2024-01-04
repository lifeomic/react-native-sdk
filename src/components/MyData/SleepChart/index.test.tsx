import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SleepChart } from './index';
import { useSleepChartData } from './useSleepChartData';
import {
  addMinutes,
  format,
  startOfDay,
  addDays,
  addMonths,
  startOfYear,
  endOfYear,
  addHours,
} from 'date-fns';
import { scaleTime } from 'd3-scale';

jest.unmock('@react-navigation/native');
jest.mock('./useSleepChartData', () => ({
  useSleepChartData: jest.fn(),
}));

jest.mock(
  'victory-native/src/components/victory-primitives/tspan',
  () =>
    ({ children }: any) =>
      <Text>{children}</Text>,
);
jest.mock('react-native-svg', () => {
  const actual = jest.requireActual('react-native-svg');

  return new Proxy(actual, {
    get(target, prop) {
      if (prop === 'Text') {
        return ({ children }: any) => <Text>{children}</Text>;
      }

      return target[prop];
    },
  });
});

const mockUseSleepChartData = useSleepChartData as any as jest.Mock<
  ReturnType<typeof useSleepChartData>
>;

const REM = {
  system: 'http://loinc.org',
  code: '93829-0',
};
const Awake = {
  system: 'http://loinc.org',
  code: '93828-2',
};
const Light = {
  system: 'http://loinc.org',
  code: '93830-8',
};
const Deep = {
  system: 'http://loinc.org',
  code: '93831-6',
};

describe('SleepChart', () => {
  it('should render daily chart', async () => {
    const dateRange = {
      start: startOfDay(new Date(0)),
      end: startOfDay(new Date(0)),
    };
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          component: [
            {
              code: {
                coding: [REM],
              },
              valuePeriod: {
                start: new Date(0).toISOString(),
                end: addMinutes(new Date(0), 2).toISOString(),
              },
            },
            {
              code: {
                coding: [Awake],
              },
              valuePeriod: {
                start: addMinutes(new Date(0), 2).toISOString(),
                end: addMinutes(new Date(0), 3).toISOString(),
              },
            },
            {
              code: {
                coding: [Light],
              },
              valuePeriod: {
                start: addMinutes(new Date(0), 3).toISOString(),
                end: addMinutes(new Date(0), 4).toISOString(),
              },
            },
            {
              code: {
                coding: [Deep],
              },
              valuePeriod: {
                start: addMinutes(new Date(0), 4).toISOString(),
                end: addHours(new Date(0), 3).toISOString(),
              },
            },
            // malformed components - not rendered:
            {
              code: {
                coding: [],
              },
              valuePeriod: {
                start: new Date(0).toISOString(),
              },
            },
            {
              code: {
                coding: [REM],
              },
              valuePeriod: {
                end: addMinutes(new Date(0), 5).toISOString(),
              },
            },
          ],
        },
      ],
      xDomain: scaleTime().domain([new Date(0), addHours(new Date(0), 3)]),
      dateRange: [dateRange.start, dateRange.end],
    });

    const { findByText, findByLabelText } = render(
      <SleepChart
        dateRange={dateRange}
        title="Single Day Test Title"
        onBlockScrollChange={jest.fn()}
      />,
    );

    expect(await findByText('Single Day Test Title')).toBeDefined();
    expect(await findByText(format(new Date(0), 'hh:mm aa'))).toBeDefined();
    expect(
      await findByText(format(addHours(new Date(0), 3), 'hh:mm aa')),
    ).toBeDefined();
    expect(await findByText('Awake')).toBeDefined();
    expect(await findByText('REM')).toBeDefined();
    expect(await findByText('Light')).toBeDefined();
    expect(await findByText('Deep')).toBeDefined();
    expect(
      await findByLabelText(
        `2 minutes of REM sleep starting at ${new Date(
          0,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `1 minutes of Awake sleep starting at ${addMinutes(
          new Date(0),
          2,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `1 minutes of Light sleep starting at ${addMinutes(
          new Date(0),
          3,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `176 minutes of Deep sleep starting at ${addMinutes(
          new Date(0),
          4,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
  });

  it('should select data on daily chart', async () => {
    const dateRange = {
      start: startOfDay(new Date(0)),
      end: startOfDay(new Date(0)),
    };
    const xDomain = scaleTime().domain([
      new Date(0),
      addMinutes(new Date(0), 2),
    ]);
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          component: [
            {
              code: {
                coding: [REM],
              },
              valuePeriod: {
                start: new Date(0).toISOString(),
                end: addMinutes(new Date(0), 2).toISOString(),
              },
            },
          ],
        },
      ],
      xDomain,
      dateRange: [dateRange.start, dateRange.end],
    });

    const onBlockScrollChange = jest.fn();

    const { findByText, findAllByText, getByTestId } = render(
      <SleepChart
        dateRange={dateRange}
        title="Single Day Test Title"
        onBlockScrollChange={onBlockScrollChange}
      />,
    );

    await act(async () => {
      const selector = await getByTestId('sleep-chart-data-selector');

      let touchStart = Date.now();
      selector.props.onStartShouldSetResponder({
        nativeEvent: { timestamp: touchStart },
      });
      let shouldSetRes = selector.props.onMoveShouldSetResponder({
        nativeEvent: { timestamp: touchStart },
      });

      expect(shouldSetRes).toBe(false); // Touch move happened too soon so we don't respond and let a parent element respond instead

      shouldSetRes = selector.props.onMoveShouldSetResponder({
        nativeEvent: { timestamp: touchStart + 500, touches: [] },
      });

      expect(shouldSetRes).toBe(false); // No touches so we shouldn't respond

      shouldSetRes = selector.props.onMoveShouldSetResponder({
        nativeEvent: { timestamp: touchStart + 500, touches: [{}] },
      });

      expect(shouldSetRes).toBe(true); // Touch exists and timestamp diff was >= 500 so respond

      shouldSetRes = selector.props.onMoveShouldSetResponder({
        nativeEvent: { timestamp: touchStart + 500, touches: [{}] },
      });

      expect(shouldSetRes).toBe(true); // No touches so we shouldn't respond

      selector.props.onResponderGrant(); // Call grant on this responder since it returned true

      expect(onBlockScrollChange).toHaveBeenLastCalledWith(true); // If responding we should block scrolling

      selector.props.onResponderMove({
        nativeEvent: { locationX: xDomain(addMinutes(new Date(0), 1)) },
      });
    });

    await waitFor(async () => {
      expect(await findAllByText('REM')).toHaveLength(2); // axis and tooltip
    });
    expect(
      await findByText(format(addMinutes(new Date(0), 1), 'h:mm aa')), // tooltip header
    ).toBeDefined();
    expect(await findByText('Stage')).toBeDefined(); // tooltip subtitle
  });

  it('should render multi day chart', async () => {
    const dateRange = {
      start: startOfDay(new Date(0)),
      end: startOfDay(addDays(new Date(0), 7)),
    };
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(new Date(0), 7 * 60).toISOString(),
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: addMinutes(new Date(0), 7 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addDays(new Date(0), 1),
            9.5 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addDays(new Date(0), 1).toISOString(),
            end: addMinutes(addDays(new Date(0), 1), 9.5 * 60).toISOString(),
          },
        },
      ],
      xDomain: scaleTime().domain([dateRange.start, dateRange.end]),
      dateRange: [dateRange.start, dateRange.end],
    });

    const { findByText, findByLabelText } = render(
      <SleepChart
        dateRange={dateRange}
        title="Multi Day Test Title"
        onBlockScrollChange={jest.fn()}
      />,
    );

    expect(await findByText('Multi Day Test Title')).toBeDefined();
    expect(await findByText(format(new Date(0), 'MM/dd'))).toBeDefined();
    expect(
      await findByText(format(addDays(new Date(0), 7), 'MM/dd')),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `7 hours and 0 minutes of sleep on ${format(
          startOfDay(addMinutes(new Date(0), 7 * 60)),
          'MMMM d',
        )}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `9 hours and 30 minutes of sleep on ${format(
          startOfDay(addMinutes(addDays(new Date(0), 1), 9.5 * 60)),
          'MMMM d',
        )}`,
      ),
    ).toBeDefined();
  });

  it('should select data on multi-day chart', async () => {
    const dateRange = {
      start: startOfDay(new Date(0)),
      end: startOfDay(addDays(new Date(0), 7)),
    };
    const xDomain = scaleTime().domain([dateRange.start, dateRange.end]);
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(new Date(0), 7 * 60).toISOString(),
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: addMinutes(new Date(0), 7 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addDays(new Date(0), 1),
            15.5 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addDays(new Date(0), 1).toISOString(),
            end: addMinutes(addDays(new Date(0), 1), 15.5 * 60).toISOString(),
          },
        },
      ],
      xDomain,
      dateRange: [dateRange.start, dateRange.end],
    });

    const onBlockScrollChange = jest.fn();

    const { findByText, getByTestId } = render(
      <SleepChart
        dateRange={dateRange}
        title="Multi Day Test Title"
        onBlockScrollChange={onBlockScrollChange}
      />,
    );

    await act(async () => {
      const selector = await getByTestId('sleep-chart-data-selector');

      selector.props.onResponderMove({
        nativeEvent: {
          locationX: xDomain(
            startOfDay(addMinutes(addDays(new Date(0), 1), 15.5 * 60)),
          ),
        },
      });
    });

    await waitFor(async () => {
      expect(
        await findByText(
          format(
            startOfDay(addMinutes(addDays(new Date(0), 1), 15.5 * 60)),
            'MMMM d',
          ),
        ),
      ).toBeDefined();
    });
    expect(
      await findByText('15h 30m'), // tooltip header
    ).toBeDefined();
    expect(await findByText('Sleep Duration')).toBeDefined(); // tooltip subtitle
  });

  it('should render year chart', async () => {
    const dateRange = {
      start: startOfDay(startOfYear(new Date(0))),
      end: startOfDay(endOfYear(new Date(0))),
    };
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(new Date(0), 18 * 60).toISOString(),
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: addMinutes(new Date(0), 18 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addMonths(new Date(0), 1),
            9.5 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addMonths(new Date(0), 1).toISOString(),
            end: addMinutes(addMonths(new Date(0), 1), 9.5 * 60).toISOString(),
          },
        },
      ],
      xDomain: scaleTime().domain([dateRange.start, dateRange.end]),
      dateRange: [dateRange.start, dateRange.end],
    });

    const { findByText, findByLabelText } = render(
      <SleepChart
        dateRange={dateRange}
        title="Year Test Title"
        onBlockScrollChange={jest.fn()}
      />,
    );

    expect(await findByText('Year Test Title')).toBeDefined();
    expect(
      await findByText(format(startOfYear(new Date(0)), 'MMM')),
    ).toBeDefined();
    expect(
      await findByText(format(endOfYear(new Date(0)), 'MMM')),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `Average of 18 hours and 0 minutes of sleep for ${format(
          startOfDay(addMinutes(new Date(0), 18 * 60)),
          'MMMM',
        )}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `Average of 9 hours and 30 minutes of sleep for ${format(
          startOfDay(addMinutes(addMonths(new Date(0), 1), 9.5 * 60)),
          'MMMM',
        )}`,
      ),
    ).toBeDefined();
  });

  it('should select data on year chart', async () => {
    const dateRange = {
      start: startOfDay(startOfYear(new Date(0))),
      end: startOfDay(endOfYear(new Date(0))),
    };
    const xDomain = scaleTime().domain([dateRange.start, dateRange.end]);
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(new Date(0), 18 * 60).toISOString(),
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: addMinutes(new Date(0), 18 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addMonths(new Date(0), 4),
            9.5 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addMonths(new Date(0), 4).toISOString(),
            end: addMinutes(addMonths(new Date(0), 4), 9.5 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addDays(addMonths(new Date(0), 4), 1),
            8 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addDays(addMonths(new Date(0), 4), 1).toISOString(),
            end: addMinutes(
              addDays(addMonths(new Date(0), 4), 1),
              8 * 60,
            ).toISOString(),
          },
        },
      ],
      xDomain,
      dateRange: [dateRange.start, dateRange.end],
    });

    const onBlockScrollChange = jest.fn();
    const { findByText, getByTestId } = render(
      <SleepChart
        dateRange={dateRange}
        title="Year Test Title"
        onBlockScrollChange={onBlockScrollChange}
      />,
    );

    await act(async () => {
      const selector = await getByTestId('sleep-chart-data-selector');

      selector.props.onResponderMove({
        nativeEvent: {
          locationX: xDomain(addDays(addMonths(new Date(0), 4), 20)),
        },
      });
    });

    await waitFor(async () => {
      expect(
        await findByText(
          format(addDays(addMonths(new Date(0), 4), 20), 'MMMM'),
        ),
      ).toBeDefined();
    });
    expect(
      await findByText('8h 45m'), // tooltip header
    ).toBeDefined();
    expect(await findByText('Avg Duration')).toBeDefined(); // tooltip subtitle
  });

  it('calls share when the share button is pressed', async () => {
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [],
      xDomain: scaleTime().domain([new Date(0), addMinutes(new Date(0), 5)]),
      dateRange: [new Date(0), new Date(0)],
    });

    const onShare = jest.fn();

    const { getByTestId } = render(
      <SleepChart
        dateRange={{ start: new Date(0), end: new Date(0) }}
        onShare={onShare}
        title="Test Title"
        onBlockScrollChange={jest.fn()}
      />,
    );

    await act(async () => fireEvent.press(await getByTestId('share-button')));

    expect(onShare).toHaveBeenCalledWith({
      dataUri: 'mockImageData',
      dateRange: [startOfDay(new Date(0)), startOfDay(new Date(0))],
      selectedPoints: [],
      title: 'Test Title',
    });
  });
});
