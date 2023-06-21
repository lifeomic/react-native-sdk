import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  format,
  startOfDay,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  startOfYear,
  addDays,
} from 'date-fns';
import { AppConfig, useAppConfig } from '../hooks';
import { MyDataScreen } from './MyDataScreen';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';

jest.unmock('i18next');

jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

const useAppConfigMock = useAppConfig as jest.Mock;

const exampleAppConfig: AppConfig = {
  homeTab: {
    myDataSettings: {
      components: [
        {
          title: 'Chart1',
          type: 'LineChart',
          trace1: {
            code: {},
            label: 'Label1',
            type: 'Observation',
          },
        },
        {
          title: 'Chart2',
          type: 'LineChart',
          trace1: {
            code: {},
            label: 'Label1',
            type: 'Observation',
          },
        },
      ],
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const myDataScreen = (
  <QueryClientProvider client={queryClient}>
    <GraphQLClientContextProvider baseURL={baseURL}>
      <MyDataScreen />
    </GraphQLClientContextProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  useAppConfigMock.mockReturnValue({
    isLoading: false,
    data: exampleAppConfig,
  });
});

test('renders loading indicator while app config fetching', async () => {
  useAppConfigMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(myDataScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders My Data Screen', async () => {
  const day = new Date();
  const weekStart = startOfWeek(day);
  const weekEnd = endOfWeek(day);

  const { getByText } = render(myDataScreen);
  expect(await getByText('Chart1')).toBeDefined();
  expect(await getByText('Chart2')).toBeDefined();
  expect(
    await getByText(
      `${format(weekStart, 'MMMM dd')}-${format(weekEnd, 'dd, yyyy')}`,
    ),
  ).toBeDefined();
});

test('can select different search periods', async () => {
  const week = startOfWeek(new Date());
  const day = startOfDay(week);
  const month = startOfMonth(week);
  const year = startOfYear(month);

  const { getByText } = render(myDataScreen);

  fireEvent.press(await getByText('DAY'));
  expect(await getByText(`${format(day, 'MMMM dd, yyyy')}`)).toBeDefined();

  fireEvent.press(await getByText('WEEK'));
  expect(
    await getByText(
      `${format(week, 'MMMM dd')}-${format(endOfWeek(week), 'dd, yyyy')}`,
    ),
  ).toBeDefined();

  fireEvent.press(await getByText('MONTH'));
  expect(
    await getByText(
      `${format(month, 'MMMM dd')}-${format(endOfMonth(month), 'dd, yyyy')}`,
    ),
  ).toBeDefined();

  fireEvent.press(await getByText('YEAR'));
  expect(await getByText(`${format(year, 'yyyy')}`)).toBeDefined();
});

test('can navigate period ranges', async () => {
  const week = startOfWeek(new Date());
  const day = startOfDay(week);

  const { getByText, getByLabelText } = render(myDataScreen);

  fireEvent.press(await getByText('DAY'));
  expect(await getByText(`${format(day, 'MMMM dd, yyyy')}`)).toBeDefined();

  fireEvent.press(await getByLabelText("Previous period's data"));
  fireEvent.press(await getByLabelText("Previous period's data"));
  expect(
    await getByText(`${format(addDays(day, -2), 'MMMM dd, yyyy')}`),
  ).toBeDefined();

  fireEvent.press(await getByLabelText("Next period's data"));
  expect(
    await getByText(`${format(addDays(day, -1), 'MMMM dd, yyyy')}`),
  ).toBeDefined();
});
