import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TrackerDetailsProvider } from './TrackerDetailsProvider';
import { useTrackerValues } from '../hooks/useTrackerValues';
import {
  TrackerValuesContext,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
} from '../services/TrackTileService';
import { notifier } from '../services/EmitterService';
import { startOfYesterday, format, add } from 'date-fns';
import * as fhirHelperModule from './to-fhir-resource';
import { Platform, View } from 'react-native';

jest.unmock('i18next');

jest.mock('../hooks/useTrackerValues');
jest.mock('lodash/debounce', () => jest.fn((fn) => fn));
jest.mock('@react-native-picker/picker', () => {
  const Picker = (props: any) => <View {...props} />;
  Picker.Item = (props: any) => <View {...props} />;

  return { Picker };
});

const mockUseTrackerValues: jest.Mock<typeof useTrackerValues> =
  useTrackerValues as any;

const valuesContext: TrackerValuesContext = {
  system: TRACKER_CODE_SYSTEM,
  codeBelow: TRACKER_CODE,
};

describe('Tracker Details', () => {
  afterEach(() => {
    jest.useRealTimers();
    Platform.OS = 'ios';
  });

  it('should display tracker description', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTracker = jest.fn();

    const { findByText } = render(
      <TrackerDetailsProvider
        trackTileService={{ upsertTracker } as any}
        tracker={
          {
            id: 'someTestTracker',
            description: 'Description',
            units: [{ display: '', unit: '' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    expect(await findByText('Description')).toBeDefined();
  });

  it('should upsert the tracker when detail screen is unmounted', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTracker = jest.fn();

    const { unmount } = render(
      <TrackerDetailsProvider
        trackTileService={{ upsertTracker } as any}
        tracker={
          {
            id: 'metric-id',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    unmount();

    expect(upsertTracker).toHaveBeenCalledWith('metric-id', {
      unit: 'unit',
      target: 5,
      order: Number.MAX_SAFE_INTEGER,
    });
  });

  it('should upsert the tracker with a new target on unmount', async () => {
    Platform.OS = 'android';
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTracker = jest.fn();

    const { unmount, findByTestId } = render(
      <TrackerDetailsProvider
        trackTileService={{ upsertTracker } as any}
        tracker={
          {
            metricId: 'metric-id',
            id: 'install-id',
            target: 4,
            unit: 'unit',
            order: 0,
            units: [
              {
                display: '',
                target: 5,
                unit: 'unit',
                targetMin: 0,
                targetMax: 2,
              },
            ],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.press(await findByTestId('android-number-picker'));

    expect(await findByTestId('number-picker-option-0')).toBeDefined();
    expect(await findByTestId('number-picker-option-1')).toBeDefined();
    expect(await findByTestId('number-picker-option-2')).toBeDefined();

    fireEvent(await findByTestId('android-number-picker'), 'valueChange', '2');
    fireEvent(await findByTestId('android-number-picker'), 'blur');

    unmount();

    expect(upsertTracker).toHaveBeenCalledWith('metric-id', {
      unit: 'unit',
      target: 2,
      order: 0,
    });
  });

  it('should increment the current tracker value by one when pressing the plus button', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn();

    const { findByText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.press(await findByText('+'));

    waitFor(() => {
      expect(upsertTrackerResource).toHaveBeenCalledWith(
        valuesContext,
        expect.objectContaining({
          valueQuantity: expect.objectContaining({
            value: 1,
          }),
        }),
      );
    });
  });

  it('should decrement the current tracker value by one when pressing the plus button', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{ 'metric-id': [{ value: 5 }] }],
    } as any);

    const upsertTrackerResource = jest.fn();

    const { findByText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.press(await findByText('-'));

    waitFor(() => {
      expect(upsertTrackerResource).toHaveBeenCalledWith(
        valuesContext,
        expect.objectContaining({
          valueQuantity: expect.objectContaining({
            value: 4,
          }),
        }),
      );
    });
  });

  it('should not decrement below zero', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{ 'metric-id': [{ value: 0 }] }],
    } as any);

    const upsertTrackerResource = jest.fn();

    const { findByText } = render(
      <TrackerDetailsProvider
        trackTileService={
          { upsertTrackerResource, upsertTracker: jest.fn() } as any
        }
        tracker={
          {
            id: 'metric-id',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.press(await findByText('-'));

    waitFor(() => {
      expect(upsertTrackerResource).not.toHaveBeenCalled();
    });
  });

  it("should allow editing a previous day's value", async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn();

    const { findByText, findByLabelText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.press(await findByLabelText('Go to previous day'));
    fireEvent.press(await findByText('+'));

    const yesterday = startOfYesterday();

    waitFor(() => {
      expect(upsertTrackerResource).toHaveBeenCalledWith(
        valuesContext,
        expect.objectContaining({
          effectiveDateTime: format(yesterday, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          valueQuantity: expect.objectContaining({
            value: 1,
          }),
        }),
      );
    });
  });

  it('should render from referenceDate when provided', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn();
    const referenceDate = new Date('2023-03-17T03:24:00');

    const { findByText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        referenceDate={referenceDate}
      />,
    );

    await findByText(format(referenceDate, 'iiii, MMMM d'));
    await findByText('Mar 11-Mar 17');
  });

  it('should NOT render from referenceDate in the future', async () => {
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [{}],
    } as any);

    const upsertTrackerResource = jest.fn();
    const now = new Date();
    const referenceDate = add(now, { months: 2 });

    const { findByText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            resourceType: 'Observation',
            units: [{ display: 'widgets', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
        referenceDate={referenceDate}
      />,
    );

    await findByText("Today's Widgets");
    await findByText(
      `${format(add(now, { days: -6 }), 'MMM d')}-${format(now, 'MMM d')}`,
    );
  });

  it('should allow decrementing across multiple observations', async () => {
    const notifierSpy = jest.spyOn(notifier, 'emit');
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          'metric-id': [
            { id: '1', value: 1 },
            { id: '2', value: 1 },
            { id: '3', value: 1 },
            { id: '4', value: 1 },
          ],
        },
      ],
    } as any);

    const deleteTrackerResource = jest.fn().mockResolvedValue(true);

    const { findByLabelText } = render(
      <TrackerDetailsProvider
        trackTileService={
          { deleteTrackerResource, upsertTracker: jest.fn() } as any
        }
        tracker={
          {
            id: 'metric-id',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.changeText(await findByLabelText(/Tracker value/), '1');
    fireEvent(await findByLabelText(/Tracker value/), 'submitEditing');

    await waitFor(() => expect(deleteTrackerResource).toHaveBeenCalledTimes(3));

    expect(notifierSpy).toHaveBeenCalledWith('valuesChanged', [
      expect.objectContaining({
        tracker: expect.objectContaining({ id: '1' }),
        drop: true,
      }),
      expect.objectContaining({
        tracker: expect.objectContaining({ id: '2' }),
        drop: true,
      }),
      expect.objectContaining({
        tracker: expect.objectContaining({ id: '3' }),
        drop: true,
      }),
    ]);
  });

  it('should allow incrementing value with multiple observations', async () => {
    const notifierSpy = jest.spyOn(notifier, 'emit');
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          'metric-id': [
            { id: '1', value: 1 },
            { id: '2', value: 1 },
          ],
        },
      ],
    } as any);

    const upsertTrackerResource = jest
      .fn()
      .mockResolvedValue({ id: '1', value: 4 });

    const { findByLabelText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            units: [{ display: '', target: 5, unit: 'unit' }],
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.changeText(await findByLabelText(/Tracker value/), '5');
    fireEvent(await findByLabelText(/Tracker value/), 'submitEditing');

    await waitFor(() => expect(notifierSpy).toHaveBeenCalled());

    expect(upsertTrackerResource).toHaveBeenCalledTimes(1);
    expect(notifierSpy).toHaveBeenCalledWith('valuesChanged', [
      expect.objectContaining({
        tracker: expect.objectContaining({ id: '1', value: 4 }),
      }),
    ]);
  });

  it('should allow incrementing value with multiple procedures', async () => {
    const notifierSpy = jest.spyOn(notifier, 'emit');
    const toFhirSpy = jest.spyOn(fhirHelperModule, 'toFhirResource');
    mockUseTrackerValues.mockReturnValue({
      loading: false,
      trackerValues: [
        {
          'metric-id': [
            { id: '1', value: 60 },
            { id: '2', value: 60 },
          ],
        },
      ],
    } as any);

    const upsertTrackerResource = jest
      .fn()
      .mockResolvedValue({ id: '1', value: 240 });

    const { findByLabelText } = render(
      <TrackerDetailsProvider
        trackTileService={
          {
            datastoreSettings: {},
            upsertTrackerResource,
            upsertTracker: jest.fn(),
          } as any
        }
        tracker={
          {
            id: 'metric-id',
            units: [{ display: '', target: 5, code: 'min', unit: 'min' }],
            resourceType: 'Procedure',
          } as any
        }
        valuesContext={valuesContext}
      />,
    );

    fireEvent.changeText(await findByLabelText(/Tracker value/), '5');
    fireEvent(await findByLabelText(/Tracker value/), 'submitEditing');

    await waitFor(() => expect(upsertTrackerResource).toHaveBeenCalled());

    expect(upsertTrackerResource).toHaveBeenCalledTimes(1);
    expect(toFhirSpy).toHaveBeenCalledWith(
      'Procedure',
      expect.objectContaining({
        value: 4, // toFhirResource expects data to be in preferred unit format, i.e. minutes
      }),
    );
    expect(notifierSpy).toHaveBeenCalledWith('valuesChanged', [
      expect.objectContaining({
        tracker: expect.objectContaining({ id: '1', value: 240 }),
      }),
    ]);
  });
});
