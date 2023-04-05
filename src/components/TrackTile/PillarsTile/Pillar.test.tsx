import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pillar } from './Pillar';
import {
  Tracker,
  TrackTileServiceProvider,
} from '../services/TrackTileService';
import debounce from 'lodash/debounce';

jest.unmock('i18next');

jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

const mockDebounce = debounce as any as jest.Mock<typeof debounce>;

const tracker: Tracker = {
  metricId: '1',
  resourceType: 'Observation',
  units: [{}],
  system: 'system',
  code: '1',
  target: 3,
} as Partial<Tracker> as any;

const renderWithProviders = (children: React.ReactNode) => {
  const providers = {
    datastoreSettings: {},
    upsertTrackerResource: jest.fn(),
  };

  const result = render(
    <TrackTileServiceProvider value={providers as any}>
      {children}
    </TrackTileServiceProvider>,
  );

  return { ...providers, ...result };
};

describe('Pillar', () => {
  it('should show the loading indicator when pillar is loading', async () => {
    const { findByTestId } = renderWithProviders(
      <Pillar
        onOpenDetails={jest.fn()}
        tracker={tracker}
        valuesContext={{} as any}
        loading
      />,
    );

    expect(await findByTestId('pillar-loading-1')).toBeDefined();
  });

  it('should allow adding multiple values', async () => {
    let handler: () => any | undefined;
    mockDebounce.mockImplementation(
      (fn: any) =>
        (...args) =>
          (handler = () => fn(...args)) as any,
    );

    const { findByTestId, findByText, upsertTrackerResource } =
      renderWithProviders(
        <Pillar
          onOpenDetails={jest.fn()}
          tracker={tracker}
          valuesContext={{} as any}
        />,
      );

    upsertTrackerResource.mockResolvedValue({ value: 3 });

    await waitFor(async () => expect(await findByText('0')).toBeDefined());

    fireEvent.press(await findByTestId('pillar-increment-1'));
    fireEvent.press(await findByTestId('pillar-increment-1'));
    fireEvent.press(await findByTestId('pillar-increment-1'));

    await waitFor(async () => expect(await findByText('3')).toBeDefined());

    await act(() => handler?.());

    expect(upsertTrackerResource).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        valueQuantity: expect.objectContaining({
          value: 3,
        }),
      }),
    );
  });

  it('should update only the default tracker type', async () => {
    let handler: () => any | undefined;
    mockDebounce.mockImplementation(
      (fn: any) =>
        (...args) =>
          (handler = () => fn(...args)) as any,
    );

    const { findByTestId, findByText, upsertTrackerResource } =
      renderWithProviders(
        <Pillar
          onOpenDetails={jest.fn()}
          tracker={tracker}
          valuesContext={{} as any}
          trackerValues={[
            {
              code: { coding: [{ system: 'system', code: '1' } as any] },
              createdDate: new Date(),
              id: 'id',
              value: 1,
            },
            {
              code: { coding: [{ system: 'other', code: '1' } as any] },
              createdDate: new Date(),
              id: 'id2',
              value: 1,
            },
          ]}
        />,
      );

    upsertTrackerResource.mockResolvedValue({ value: 2 });

    await waitFor(async () => expect(await findByText('2')).toBeDefined());

    fireEvent.press(await findByTestId('pillar-increment-1'));

    await waitFor(async () => expect(await findByText('3')).toBeDefined());

    await act(() => handler?.());

    expect(upsertTrackerResource).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'id',
        code: {
          coding: [
            expect.objectContaining({
              system: 'system',
              code: '1',
            }),
          ],
        },
        valueQuantity: expect.objectContaining({
          value: 2,
        }),
      }),
    );
  });

  it('should handle no default tracker type existing', async () => {
    let handler: () => any | undefined;
    mockDebounce.mockImplementation(
      (fn: any) =>
        (...args) =>
          (handler = () => fn(...args)) as any,
    );

    const { findByTestId, findByText, upsertTrackerResource } =
      renderWithProviders(
        <Pillar
          onOpenDetails={jest.fn()}
          tracker={tracker}
          valuesContext={{} as any}
          trackerValues={[
            {
              code: { coding: [{ system: 'other', code: '1' } as any] }, // Not default code
              createdDate: new Date(),
              id: 'id2',
              value: 1,
            },
          ]}
        />,
      );

    upsertTrackerResource.mockResolvedValue({ value: 1 });

    await waitFor(async () => expect(await findByText('1')).toBeDefined());

    fireEvent.press(await findByTestId('pillar-increment-1'));

    await waitFor(async () => expect(await findByText('2')).toBeDefined());

    await act(() => handler?.());

    expect(upsertTrackerResource).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        code: {
          coding: [
            expect.objectContaining({
              system: 'system',
              code: '1',
            }),
          ],
        },
        valueQuantity: expect.objectContaining({
          value: 1,
        }),
      }),
    );
  });

  it('should reset tracker value on error', async () => {
    const onError = jest.fn();
    let handler: () => any | undefined;
    mockDebounce.mockImplementation(
      (fn: any) =>
        (...args) =>
          (handler = () => fn(...args)) as any,
    );

    const { findByTestId, findByText, upsertTrackerResource } =
      renderWithProviders(
        <Pillar
          onOpenDetails={jest.fn()}
          tracker={tracker}
          valuesContext={{} as any}
          onError={onError}
          trackerValues={[
            {
              code: { coding: [{ system: 'other', code: '1' } as any] },
              createdDate: new Date(),
              id: 'id2',
              value: 1,
            },
          ]}
        />,
      );

    upsertTrackerResource.mockRejectedValue('Simulated Error');

    await waitFor(async () => expect(await findByText('1')).toBeDefined());

    fireEvent.press(await findByTestId('pillar-increment-1'));
    fireEvent.press(await findByTestId('pillar-increment-1'));
    fireEvent.press(await findByTestId('pillar-increment-1'));

    await waitFor(async () => expect(await findByText('4')).toBeDefined());

    await act(() => handler?.());

    expect(upsertTrackerResource).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('Simulated Error');
    await waitFor(async () => expect(await findByText('1')).toBeDefined());
  });
});
