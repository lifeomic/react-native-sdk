import React from 'react';
import { fireEvent, render, act } from '../../../common/testHelpers/testing-library-wrapper';
import {
  ManageTrackersProvider,
  ManageTrackersProviderProps,
} from './ManageTrackersProvider';
import { merge } from 'lodash';

jest.unmock('i18next');

jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const mockComponent = jest.requireActual('react-native/jest/mockComponent');
  return mockComponent('react-native/Libraries/Components/Switch/Switch');
});

type PartialDeep<T> = T extends {}
  ? {
      [P in keyof T]?: PartialDeep<T[P]>;
    }
  : T;

const renderManageTrackers = (
  args: PartialDeep<ManageTrackersProviderProps>,
) => {
  return render(
    <ManageTrackersProvider
      {...(merge(
        {
          onOpenTracker: jest.fn(),
          trackTileService: {},
          trackerRequestMeta: {
            loading: false,
            trackers: [],
            errors: {
              metricsError: undefined,
              trackersError: undefined,
            },
          },
        } as any,
        args,
      ) as ManageTrackersProviderProps)}
    />,
  );
};

describe('Manage Trackers', () => {
  it('should display loading icon when trackers are loading', async () => {
    const { findByRole } = renderManageTrackers({
      trackerRequestMeta: {
        loading: true,
      },
    });

    expect(await findByRole('progressbar')).toBeDefined();
  });

  it('should display an error when a tracker fetch error occurs', async () => {
    const { findByText } = renderManageTrackers({
      trackerRequestMeta: {
        error: true,
      },
    });

    expect(
      await findByText('There was a problem loading the Track-It Items'),
    ).toBeDefined();
  });

  it('should display an error when a reorder error occurs', async () => {
    const { findByText } = renderManageTrackers({
      hasReorderError: true,
    });

    expect(
      await findByText('A problem occurred while reordering the items'),
    ).toBeDefined();
  });

  it('should call onOpenTracker when a row is clicked', async () => {
    const tracker = { name: 'Tracker' };
    const onOpenTracker = jest.fn();
    const { findByText } = renderManageTrackers({
      onOpenTracker,
      trackerRequestMeta: {
        trackers: [tracker],
      },
    });

    fireEvent.press(await findByText(tracker.name));

    expect(onOpenTracker).toHaveBeenCalledWith(tracker);
  });

  it('should allow a user to reorder the trackers', async () => {
    const trackerA = {
      name: 'Tracker A',
      unit: 'A',
      target: 1,
      metricId: 'A',
      order: 0,
    };
    const trackerB = {
      name: 'Tracker B',
      unit: 'B',
      target: 1,
      metricId: 'B',
      order: 1,
    };
    const upsertTrackers = jest.fn();

    const { findByLabelText, findByText } = renderManageTrackers({
      trackTileService: {
        upsertTrackers,
      },
      trackerRequestMeta: {
        trackers: [trackerA, trackerB],
      },
    });

    await act(async () => {
      fireEvent(await findByLabelText('Reorder trackers'), 'valueChange', true);

      fireEvent(await findByText(trackerB.name), 'pressIn');

      fireEvent(await findByText(trackerB.name), 'dragEnd', {
        data: [trackerB, trackerA],
      });

      fireEvent(
        await findByLabelText('Save tracker order'),
        'valueChange',
        false,
      );
    });

    expect(upsertTrackers).toHaveBeenCalledWith(
      expect.arrayContaining([
        { metricId: 'B', unit: 'B', target: 1, order: 0 },
        { metricId: 'A', unit: 'A', target: 1, order: 1 },
      ]),
    );
  });
});
