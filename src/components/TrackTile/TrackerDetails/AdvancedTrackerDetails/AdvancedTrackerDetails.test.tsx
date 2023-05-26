import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AdvancedTrackerDetailsProvider } from './AdvancedTrackerDetailsProvider';
import { useTrackerValues } from '../../hooks/useTrackerValues';
import {
  TrackerValuesContext,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
  Tracker,
} from '../../services/TrackTileService';
import { addDays, format } from 'date-fns';
import { useRecentCodedValues } from '../../hooks/useRecentCodedValues';
import { notifier } from '../../services/EmitterService';

jest.unmock('i18next');

jest.mock('../../hooks/useTrackerValues');
jest.mock('../../hooks/useRecentCodedValues');
jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

const mockUseTrackerValues: jest.Mock<typeof useTrackerValues> =
  useTrackerValues as any;
const mockUseRecentCodedValues: jest.Mock<typeof useRecentCodedValues> =
  useRecentCodedValues as any;

const valuesContext: TrackerValuesContext = {
  system: TRACKER_CODE_SYSTEM,
  codeBelow: TRACKER_CODE,
};

describe('Tracker Advanced Details', () => {
  beforeEach(() => {
    mockUseRecentCodedValues.mockReturnValue([] as any);
  });

  it('should display the advanced tracker details screen', async () => {
    const tracker = {
      metricId: 'metric-id',
      code: 'code',
      description: 'test description',
      name: 'Test Name',
      id: 'test-id',
      units: [
        {
          code: 'unit-code',
          system: 'unit-system',
          display: 'unit',
          target: 42.5,
          unit: 'unit-unit',
          default: true,
          displayOne: '{{count}} Serving',
          displayOther: '{{count}} Servings',
        },
      ],
    } as Tracker;
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          [tracker.metricId!]: [
            {
              id: 'first-value',
              code: {
                coding: [
                  {
                    display: 'Some Value',
                  },
                ],
              },
              value: 0.5,
            },
            {
              id: 'second-value',
              code: {
                coding: [
                  {
                    display: 'Some Second Value',
                  },
                ],
              },
              value: 1,
            },
          ],
        },
      ],
    } as any);

    const { findByText, findAllByText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={
          {
            fetchOntology: jest.fn().mockRejectedValue('fake error'),
          } as any
        }
        tracker={tracker as any}
        valuesContext={valuesContext}
        onEditValue={jest.fn()}
      />,
    );

    expect(await findByText("Today's Servings")).toBeDefined();
    expect(await findAllByText('1.5')).toHaveLength(2); // Total Value & Chart Value
    expect(await findByText('42.5')).toBeDefined(); // Target Value
    expect(await findByText('The science of')).toBeDefined();
    expect(await findByText('Test Name')).toBeDefined();
    expect(await findByText('test description')).toBeDefined();
    expect(await findByText('Some Value')).toBeDefined();
    expect(await findByText('0.5 Servings')).toBeDefined();
    expect(await findByText('Some Second Value')).toBeDefined();
    expect(await findByText('1 Serving')).toBeDefined();
  }, 10000);

  it('should be able to add a new value from the quick add item list', async () => {
    const notifierSpy = jest.spyOn(notifier, 'emit');
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          'metric-id': [
            {
              id: 'first-value',
              code: {
                coding: [
                  {
                    display: 'Some Value',
                  },
                ],
              },
              value: 0.5,
            },
          ],
        },
      ],
    } as any);

    const upsertTrackerResource = jest.fn().mockResolvedValue({ value: 1 });
    const fetchOntology = jest.fn().mockResolvedValue([
      {
        specializedBy: [
          {
            id: 'fruit-id',
            code: 'fruit-code',
            display: 'Fruits',
            system: 'http://lifeomic.com/fhir/nutrition',
          },
        ],
      },
    ]);

    const { findByText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            fetchOntology,
          } as any
        }
        tracker={
          {
            id: 'tracker-id',
            metricId: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'Serving of Fruit', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        onEditValue={jest.fn()}
      />,
    );

    fireEvent.press(await findByText('+ Fruits'));

    await waitFor(() =>
      expect(upsertTrackerResource).toHaveBeenCalledWith(
        valuesContext,
        expect.objectContaining({
          valueQuantity: expect.objectContaining({
            value: 1,
          }),
        }),
      ),
    );

    expect(notifierSpy).toHaveBeenCalledWith('valuesChanged', [
      {
        valuesContext,
        metricId: 'metric-id',
        tracker: expect.objectContaining({ value: 1 }),
        saveToRecent: false,
      },
    ]);
  });

  it('should call onError when an error occurs while adding new value from the quick add item list', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn().mockRejectedValue('Some Error');
    const fetchOntology = jest.fn().mockResolvedValue([
      {
        specializedBy: [
          {
            id: 'fruit-id',
            code: 'fruit-code',
            display: 'Fruits',
            system: 'http://lifeomic.com/fhir/nutrition',
          },
        ],
      },
    ]);
    const onError = jest.fn();

    const { findByText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            fetchOntology,
          } as any
        }
        tracker={
          {
            id: 'tracker-id',
            metricId: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'Some Unit', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        onEditValue={jest.fn()}
        onError={onError}
      />,
    );

    fireEvent.press(await findByText('+ Fruits'));

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Some Error'));
  });

  it('can navigate to different days', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn();
    const fetchOntology = jest.fn().mockResolvedValue([]);
    const onError = jest.fn();

    const { findByText, findByLabelText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={{ upsertTrackerResource, fetchOntology } as any}
        tracker={
          {
            id: 'tracker-id',
            metricId: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'Servings', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        onEditValue={jest.fn()}
        onError={onError}
      />,
    );

    expect(await findByText("Today's Servings")).toBeDefined();

    fireEvent.press(await findByLabelText('Go to next day'));
    expect(await findByText("Today's Servings")).toBeDefined(); // Title does not change since you can't advance past today

    fireEvent.press(await findByLabelText('Go to previous day'));
    expect(
      await findByText(format(addDays(new Date(), -1), 'iiii, MMMM d')),
    ).toBeDefined();

    fireEvent.press(await findByLabelText('Go to next day'));
    expect(await findByText("Today's Servings")).toBeDefined();

    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByLabelText('Go to previous day'));
    expect(
      await findByText('Unable to adjust data this far in the past.'),
    ).toBeDefined();
  });

  it('should render from referenceDate when provided', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn();
    const fetchOntology = jest.fn().mockResolvedValue([]);
    const onError = jest.fn();
    const referenceDate = new Date('2023-03-17T03:24:00');

    const { findByText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={{ upsertTrackerResource, fetchOntology } as any}
        tracker={
          {
            id: 'tracker-id',
            metricId: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'Servings', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        onEditValue={jest.fn()}
        onError={onError}
        referenceDate={referenceDate}
      />,
    );

    await findByText('Friday, March 17');
    await findByText('Mar 11, 2023 - Mar 17, 2023 ');
  });

  it('calls onEditValue when tapping on a value row', async () => {
    const trackerValue = {
      id: 'first-value',
      code: {
        coding: [
          {
            display: 'Some Value',
          },
        ],
      },
      value: 1,
    };
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          'metric-id': [trackerValue],
        },
      ],
    } as any);

    const fetchOntology = jest.fn().mockResolvedValue([]);
    const onEditValue = jest.fn();

    const { findByText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={{ fetchOntology } as any}
        tracker={
          {
            id: 'tracker-id',
            metricId: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'Serving of Fruit', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        onEditValue={onEditValue}
      />,
    );

    fireEvent.press(await findByText('1 Serving of Fruit'));

    expect(onEditValue).toHaveBeenCalledWith(trackerValue);
  });

  it('should be able to add a new value from the recent list', async () => {
    const notifierSpy = jest.spyOn(notifier, 'emit');
    const trackerValue = {
      id: 'first-value',
      code: {
        coding: [
          {
            display: 'Some Value',
          },
        ],
      },
      value: 1,
    };
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          'metric-id': [trackerValue],
        },
      ],
    } as any);

    const upsertTrackerResource = jest.fn().mockResolvedValue({ value: 1 });
    const fetchOntology = jest.fn().mockResolvedValue([
      {
        specializedBy: [
          {
            code: 'code-1',
            system: 'system',
            display: 'Recent History Item',
          },
        ],
      },
    ]);
    const onEditValue = jest.fn();
    mockUseRecentCodedValues.mockReturnValue([
      { value: 1, code: { code: 'code-1', system: 'system' } },
    ] as any);

    const { findByText } = render(
      <AdvancedTrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            fetchOntology,
            upsertTrackerResource,
          } as any
        }
        tracker={
          {
            id: 'tracker-id',
            metricId: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'Servings', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        onEditValue={onEditValue}
      />,
    );

    fireEvent.press(await findByText('Recent History Item'));

    await waitFor(() =>
      expect(upsertTrackerResource).toHaveBeenCalledWith(
        valuesContext,
        expect.objectContaining({
          code: {
            coding: expect.arrayContaining([
              {
                code: 'code-1',
                system: 'system',
              },
            ]),
          },
          valueQuantity: expect.objectContaining({
            value: 1,
          }),
        }),
      ),
    );

    expect(notifierSpy).toHaveBeenCalledWith('valuesChanged', [
      {
        valuesContext,
        metricId: 'metric-id',
        tracker: expect.objectContaining({ value: 1 }),
        saveToRecent: false,
      },
    ]);
  });
});
