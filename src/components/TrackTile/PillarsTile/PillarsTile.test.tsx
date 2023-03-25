import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { PillarsTileProvider } from './PillarsTileProvider';
import {
  Tracker,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from '../services/TrackTileService';
import { startOfToday } from 'date-fns';
import debounce from 'lodash/debounce';

jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

const mockDebounce = debounce as any as jest.Mock<typeof debounce>;

const examplePillar: Tracker = {
  id: '1',
  metricId: '1',
  name: 'Pillar A',
  resourceType: 'Procedure',
  units: [
    {
      code: 'min',
      default: true,
      display: 'min',
      system: 'system',
      target: 60,
      unit: 'min',
    },
  ],
  unit: 'min',
  system: TRACKER_PILLAR_CODE_SYSTEM,
  code: 'unit-test-code',

  account: 'accountid',
  color: 'red',
  description: 'desc',
  icon: 'src/icon.png',
  lifePoints: 0,
};

const observationPillar: Tracker = {
  id: '1',
  metricId: '1',
  name: 'Pillar A',
  resourceType: 'Observation',
  units: [
    {
      code: "[arb'U]",
      default: true,
      display: 'serving',
      system: 'system',
      target: 5,
      unit: "[arb'U]",
    },
  ],
  unit: "[arb'U]",
  system: TRACKER_PILLAR_CODE_SYSTEM,
  code: 'unit-test-code',

  account: 'accountid',
  color: 'red',
  description: 'desc',
  icon: 'src/icon.png',
  lifePoints: 0,
};

const pillarValueCtx = {
  system: TRACKER_PILLAR_CODE_SYSTEM,
  codeBelow: TRACKER_PILLAR_CODE,
};

describe('Track Tile', () => {
  it('should show the loading indicator when pillar-trackers are loading', async () => {
    const { findByRole } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn(() => new Promise(jest.fn)),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenDetails={jest.fn()}
      />,
    );

    expect(await findByRole('progressbar')).toBeDefined();
  });

  it('should show different loading indication when only tracker values are loading', async () => {
    const { findByTestId } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([examplePillar]),
            fetchTrackerValues: jest
              .fn()
              .mockImplementation(() => new Promise(jest.fn)),
          } as any
        }
        onOpenDetails={jest.fn()}
      />,
    );

    const pillarLoadingView = await findByTestId('pillar-loading-1');
    expect(pillarLoadingView).toBeDefined();
  }, 10000);

  it('should display all returned pillars', async () => {
    const { findByTestId } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest
              .fn()
              .mockResolvedValue([
                examplePillar,
                { ...examplePillar, id: '2', metricId: '2' },
              ]),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenDetails={jest.fn()}
      />,
    );

    const pillar1Value = await findByTestId('pillar-value-1');
    const pillar2Value = await findByTestId('pillar-value-2');
    expect(pillar1Value).toBeDefined();
    expect(pillar2Value).toBeDefined();
  });

  it('clicking a pillar calls onOpenDetails handler with selected tracker', async () => {
    const onOpenDetails = jest.fn();

    const { findByTestId } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([examplePillar]),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenDetails={onOpenDetails}
      />,
    );

    fireEvent.press(await findByTestId('pillar-tracker-1'));

    expect(onOpenDetails).toHaveBeenCalledWith(examplePillar, {
      system: TRACKER_PILLAR_CODE_SYSTEM,
      codeBelow: TRACKER_PILLAR_CODE,
    });
  });

  it('should display pillar value based on metricId', async () => {
    const trackerValue = 60 * 2; // NOTE: 2 minutes, in seconds

    const { findByText } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([examplePillar]),
            fetchTrackerValues: jest.fn().mockResolvedValue({
              [startOfToday().toUTCString()]: {
                [examplePillar.metricId!]: [{ value: trackerValue }],
              },
            }),
          } as any
        }
        onOpenDetails={jest.fn()}
      />,
    );

    const minutesValue = trackerValue / 60;
    expect(await findByText(minutesValue.toString())).toBeDefined();
  });

  it('clicking a pillar increment button calls onSaveNewValueOverride handler', async () => {
    const onSaveNewValueOverride = jest.fn();

    const { findByTestId } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([examplePillar]),
            fetchTrackerValues: jest.fn().mockResolvedValue({}),
          } as any
        }
        onOpenDetails={jest.fn()}
        onSaveNewValueOverride={onSaveNewValueOverride}
      />,
    );

    fireEvent.press(await findByTestId('pillar-increment-1'));

    expect(onSaveNewValueOverride).toHaveBeenCalledWith(
      examplePillar,
      1,
      undefined, // Previous TrackerValue
    );
  });

  it('clicking a pillar increment button updates the pillar value', async () => {
    let handler: () => any | undefined;
    mockDebounce.mockImplementation(
      (fn: any) =>
        (...args) =>
          (handler = () => fn(...args)) as any,
    );
    const upsertTrackerResource = jest.fn().mockResolvedValue({ value: 1 });
    const { findByTestId, findByText } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([observationPillar]),
            fetchTrackerValues: jest.fn().mockResolvedValue({ data: {} }),
            upsertTrackerResource,
            datastoreSettings: {},
          } as any
        }
        onOpenDetails={jest.fn()}
      />,
    );

    await waitFor(async () => expect(await findByText('0')).toBeDefined());
    fireEvent.press(await findByTestId('pillar-increment-1'));

    await act(() => handler?.());

    expect(upsertTrackerResource).toHaveBeenCalledWith(
      pillarValueCtx,
      expect.objectContaining({
        valueQuantity: expect.objectContaining({
          value: 1,
        }),
      }),
    );
  });

  it('clicking a pillar increment button multiple times updates the pillar value and then upserts the value', async () => {
    let handler: () => any | undefined;
    mockDebounce.mockImplementation(
      (fn: any) =>
        (...args) =>
          (handler = () => fn(...args)) as any,
    );
    const upsertTrackerResource = jest.fn().mockResolvedValue({ value: 3 });
    const { findByTestId, findByText } = render(
      <PillarsTileProvider
        trackTileService={
          {
            fetchTrackers: jest.fn().mockResolvedValue([observationPillar]),
            fetchTrackerValues: jest.fn().mockResolvedValue({ data: {} }),
            upsertTrackerResource,
            datastoreSettings: {},
          } as any
        }
        onOpenDetails={jest.fn()}
      />,
    );

    await waitFor(async () => expect(await findByText('0')).toBeDefined());

    fireEvent.press(await findByTestId('pillar-increment-1'));
    fireEvent.press(await findByTestId('pillar-increment-1'));
    fireEvent.press(await findByTestId('pillar-increment-1'));

    await waitFor(async () => expect(await findByText('3')).toBeDefined());

    await act(() => handler?.());

    expect(upsertTrackerResource).toHaveBeenCalledWith(
      pillarValueCtx,
      expect.objectContaining({
        valueQuantity: expect.objectContaining({
          value: 3,
        }),
      }),
    );
  });
});
