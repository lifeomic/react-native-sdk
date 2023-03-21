import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AdvancedTrackerEditorProvider } from './AdvancedTrackerEditorProvider';
import {
  Tracker,
  CodedRelationship,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
  TrackerValuesContext
} from '../../services/TrackTileService';
import {
  notifier,
  notifySaveEditTrackerValue
} from '../../services/EmitterService';

const tracker: Tracker = {
  account: '',
  code: TRACKER_PILLAR_CODE,
  system: TRACKER_PILLAR_CODE_SYSTEM,
  color: '#000000',
  description: 'description',
  icon: 'icon',
  id: 'tracker-id',
  lifePoints: 0,
  name: 'Tracker',
  resourceType: 'Observation',
  units: [
    {
      code: 'value-code',
      system: 'value-system',
      unit: 'value-unit',
      display: 'value-display',
      target: 1,
      default: true,
      displayOne: '{{count}} Unit Display'
    }
  ]
};

const valuesContext: TrackerValuesContext = {
  codeBelow: TRACKER_PILLAR_CODE,
  system: TRACKER_PILLAR_CODE_SYSTEM
};

const codedRelationship = (
  code: string,
  subCodes?: () => CodedRelationship[],
  details?: Partial<CodedRelationship>
): CodedRelationship => ({
  id: code,
  code,
  display: code,
  specializedBy: subCodes?.() ?? [],
  system: `${code}|system`,
  ...details
});

describe('Tracker Advanced Details', () => {
  it('should display the advanced tracker details screen', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-1', () => [
            codedRelationship('subCategory-1')
          ])
        ])
      ]);

    const { findByText } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'value-code',
                system: 'value-system',
                display: 'Parent Category'
              }
            ]
          },
          value: 0.5
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    expect(await findByText('0.5')).toBeDefined();
    expect(await findByText('Unit Display')).toBeDefined();
    expect(await findByText('Select Parent Category')).toBeDefined();
    expect(await findByText('category-1')).toBeDefined();
    expect(await findByText('Selected: Parent Category')).toBeDefined();
    expect(await findByText('subCategory-1')).toBeDefined();
  }, 10000);

  it('pre-selects category from tracker value coding', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-1', () => [
            codedRelationship('subCategory-1')
          ])
        ])
      ]);

    const { findByText } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'category-1',
                system: 'category-1|system',
                display: 'category-1'
              },
              {
                code: 'value-code',
                system: 'value-system',
                display: 'Parent Category'
              }
            ]
          },
          value: 0.5
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    expect(await findByText('Select Parent Category')).toBeDefined();
    expect(await findByText('Selected: category-1')).toBeDefined();
  });

  it('pre-selects sub-category from tracker value coding', async () => {
    const fetchOntology = jest.fn().mockReturnValue([
      codedRelationship('group', () => [
        codedRelationship('category-1', () => [
          codedRelationship('subCategory-1', undefined, {
            educationContent: {
              description: 'Detail description',
              url: 'http://learnmore.org'
            }
          })
        ])
      ])
    ]);

    const { findByText } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'subCategory-1',
                system: 'subCategory-1|system',
                display: 'subCategory-1'
              },
              {
                code: 'value-code',
                system: 'value-system',
                display: 'Parent Category'
              }
            ]
          },
          value: 0.5
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    expect(await findByText('Select Parent Category')).toBeDefined();
    expect(await findByText('Selected: subCategory-1')).toBeDefined();
    expect(await findByText('Detail description')).toBeDefined();
    expect(await findByText('Learn More')).toBeDefined();
  });

  it('can make selections', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-1', () => [
            codedRelationship('subCategory-1')
          ]),
          codedRelationship('category-2', () => [
            codedRelationship('subCategory-2')
          ])
        ])
      ]);

    const { findByText, findByTestId, queryByTestId, findAllByText } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'value-code',
                system: 'value-system',
                display: 'Parent Category'
              }
            ]
          },
          value: 0.5
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    fireEvent.press(await findByText('category-1'));
    expect(await findByText('Selected: category-1')).toBeDefined();

    fireEvent.press(await findByText('subCategory-1'));
    expect(await findByTestId('selected-category-category-1')).toBeDefined();
    expect(await findByText('Selected: subCategory-1')).toBeDefined();

    fireEvent.press(await findByText('category-1'));
    expect(await findByText('Selected: category-1')).toBeDefined();

    fireEvent.press((await findAllByText('category-1'))[0]);
    expect(await findByText('Selected: Parent Category')).toBeDefined();
    expect(await queryByTestId(/selected-(sub-)?category/)).toBeNull();

    fireEvent.press(await findByText('category-1'));
    expect(await findByText('Selected: category-1')).toBeDefined();
    expect(await queryByTestId('selected-sub-category')).toBeNull();

    fireEvent.press(await findByText('subCategory-1'));
    expect(await findByTestId('selected-category-category-1')).toBeDefined();
    expect(await findByText('Selected: subCategory-1')).toBeDefined();

    fireEvent.press(await findByText('category-2'));
    expect(await findByText('Selected: category-2')).toBeDefined();
    expect(await queryByTestId('selected-sub-category')).toBeNull();

    fireEvent.press((await findAllByText('category-2'))[0]);
    expect(await findByText('Selected: Parent Category')).toBeDefined();
    expect(await queryByTestId(/selected-(sub-)?category/)).toBeNull();

    fireEvent.press(await findByText('subCategory-2'));
    expect(await findByTestId('selected-category-category-2')).toBeDefined();
    expect(await findByText('Selected: subCategory-2')).toBeDefined();

    fireEvent.press((await findAllByText('subCategory-2'))[1]);
    expect(await findByTestId('selected-category-category-2')).toBeDefined();
    expect(await findByText('Selected: category-2')).toBeDefined();
    expect(await queryByTestId('selected-sub-category')).toBeNull();
  });

  it('can modify an Observation unit value', async () => {
    const fetchOntology = jest.fn().mockReturnValue([]);

    const { findByText, findByTestId } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology
          } as any
        }
        valuesContext={valuesContext}
        tracker={{
          ...tracker,
          resourceType: 'Observation',
          units: [
            {
              ...tracker.units[0],
              stepAmount: 0.5
            }
          ]
        }}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: { coding: [] },
          value: 0.5
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    expect(await findByText('0.5')).toBeDefined();

    // Increments by the step value
    fireEvent.press(await findByTestId('increment-value'));
    expect(await findByText('1')).toBeDefined();

    // Does not decrement beyond 0
    fireEvent.press(await findByTestId('decrement-value'));
    fireEvent.press(await findByTestId('decrement-value'));
    fireEvent.press(await findByTestId('decrement-value'));
    expect(await findByText('0')).toBeDefined();
  });

  it('can modify an Procedure unit value', async () => {
    const fetchOntology = jest.fn().mockReturnValue([]);

    const { findByText, findByTestId, findAllByText } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology
          } as any
        }
        valuesContext={valuesContext}
        tracker={{
          ...tracker,
          resourceType: 'Procedure',
          units: [
            {
              ...tracker.units[0],
              code: 'min',
              stepAmount: 5 // 5 minutes
            }
          ]
        }}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: { coding: [] },
          value: 55 * 60 // 55 minutes in seconds
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    expect(await findByText('00')).toBeDefined();
    expect(await findByText('55')).toBeDefined();

    // Increments up to the next hour
    fireEvent.press(await findByTestId('increment-value'));
    expect(await findByText('01')).toBeDefined();
    expect(await findByText('00')).toBeDefined();

    // Can switch to incrementing hours and adds 2 hours
    fireEvent.press(await findByText('hrs'));
    fireEvent.press(await findByTestId('increment-value'));
    fireEvent.press(await findByTestId('increment-value'));
    expect(await findByText('03')).toBeDefined();
    expect(await findByText('00')).toBeDefined();

    // Can switch back to incrementing by minutes and removes 5 minutes
    fireEvent.press(await findByText('min'));
    fireEvent.press(await findByTestId('decrement-value'));
    expect(await findByText('02')).toBeDefined();
    expect(await findByText('55')).toBeDefined();

    // Decrementing by hours with partial time drops to closest hour. i.e. 2:55 => 2:00
    fireEvent.press(await findByText('hrs'));
    fireEvent.press(await findByTestId('decrement-value'));
    expect(await findByText('02')).toBeDefined();
    expect(await findByText('00')).toBeDefined();

    // Does not decrement beyond 0
    fireEvent.press(await findByTestId('decrement-value'));
    fireEvent.press(await findByTestId('decrement-value'));
    fireEvent.press(await findByTestId('decrement-value'));
    expect(await findAllByText('00')).toHaveLength(2);
  });

  it('saves the value when saveEditTrackerValue event is emitted and the value has changed', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-coding', () => [
            codedRelationship('detail-coding')
          ])
        ])
      ]);
    const upsertTrackerResource = jest
      .fn()
      .mockImplementation((_, resource) => resource);

    const { findByTestId } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            datastoreSettings: {},
            fetchOntology,
            upsertTrackerResource
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'detail-coding',
                display: 'detail-coding',
                system: 'detail-coding|system'
              }
            ]
          },
          value: 1
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    const spy = jest.spyOn(notifier, 'addListener').mockClear();

    // Increase Value to trigger a change
    fireEvent.press(await findByTestId('increment-value'));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    await new Promise(notifySaveEditTrackerValue);

    expect(upsertTrackerResource).toHaveBeenCalledWith(valuesContext, {
      code: {
        coding: [
          {
            code: 'detail-coding',
            display: 'detail-coding',
            system: 'detail-coding|system'
          },
          {
            code: 'tracker-id',
            display: 'Tracker',
            system: TRACKER_PILLAR_CODE_SYSTEM
          }
        ]
      },
      id: 'value',
      meta: {
        tag: [
          {
            code: undefined,
            system: 'http://lifeomic.com/fhir/dataset'
          }
        ]
      },
      resourceType: 'Observation',
      status: 'final',
      effectiveDateTime: expect.any(String),
      valueQuantity: {
        code: 'value-code',
        system: 'value-system',
        unit: 'value-unit',
        value: 2 // new value
      }
    });
  });

  it('saves the value when saveEditTrackerValue event is emitted and the coding has changed', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-coding', () => [
            codedRelationship('detail-coding-1'),
            codedRelationship('detail-coding-2')
          ])
        ])
      ]);
    const upsertTrackerResource = jest
      .fn()
      .mockImplementation((_, resource) => resource);

    const { findByText } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            datastoreSettings: {},
            fetchOntology,
            upsertTrackerResource
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'detail-coding-1',
                display: 'detail-coding-1',
                system: 'detail-coding-1|system'
              }
            ]
          },
          value: 1
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    const spy = jest.spyOn(notifier, 'addListener').mockClear();

    // Increase Value to trigger a change
    fireEvent.press(await findByText('detail-coding-2'));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    await new Promise(notifySaveEditTrackerValue);

    expect(upsertTrackerResource).toHaveBeenCalledWith(valuesContext, {
      code: {
        coding: [
          // new coding
          {
            code: 'detail-coding-2',
            display: 'detail-coding-2',
            system: 'detail-coding-2|system'
          },
          {
            code: 'tracker-id',
            display: 'Tracker',
            system: TRACKER_PILLAR_CODE_SYSTEM
          }
        ]
      },
      id: 'value',
      meta: {
        tag: [
          {
            code: undefined,
            system: 'http://lifeomic.com/fhir/dataset'
          }
        ]
      },
      resourceType: 'Observation',
      status: 'final',
      effectiveDateTime: expect.any(String),
      valueQuantity: {
        code: 'value-code',
        system: 'value-system',
        unit: 'value-unit',
        value: 1
      }
    });
  });

  it('removes the value when saveEditTrackerValue event is emitted and the value is zero', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-coding', () => [
            codedRelationship('detail-coding')
          ])
        ])
      ]);
    const deleteTrackerResource = jest.fn().mockReturnValue(true);

    const { findByTestId } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology,
            deleteTrackerResource
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value-id',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'detail-coding',
                display: 'detail-coding',
                system: 'detail-coding|system'
              }
            ]
          },
          value: 1
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    const spy = jest.spyOn(notifier, 'addListener').mockClear();

    // Decrease Value to zero
    fireEvent.press(await findByTestId('decrement-value'));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    await new Promise(notifySaveEditTrackerValue);

    expect(deleteTrackerResource).toHaveBeenCalledWith(
      valuesContext,
      tracker.resourceType,
      'value-id'
    );
  });

  it('throws an error when removing the value fails', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-coding', () => [
            codedRelationship('detail-coding')
          ])
        ])
      ]);
    const deleteTrackerResource = jest.fn().mockReturnValue(false);

    const { findByTestId } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology,
            deleteTrackerResource
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value-id',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'detail-coding',
                display: 'detail-coding',
                system: 'detail-coding|system'
              }
            ]
          },
          value: 1
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    const spy = jest.spyOn(notifier, 'addListener').mockClear();

    // Decrease Value to zero
    fireEvent.press(await findByTestId('decrement-value'));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    expect(
      async () => await new Promise(notifySaveEditTrackerValue)
    ).rejects.toThrowError('Could not delete the value');
  });

  it('should not save the value when saveEditTrackerValue event is emitted and no changes have occurred', async () => {
    const fetchOntology = jest
      .fn()
      .mockReturnValue([
        codedRelationship('group', () => [
          codedRelationship('category-coding', () => [
            codedRelationship('detail-coding')
          ])
        ])
      ]);
    const upsertTrackerResource = jest
      .fn()
      .mockImplementation((_, resource) => resource);

    render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            fetchOntology,
            upsertTrackerResource
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'detail-coding',
                display: 'detail-coding',
                system: 'detail-coding|system'
              }
            ]
          },
          value: 1
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    await new Promise(notifySaveEditTrackerValue);

    expect(upsertTrackerResource).not.toHaveBeenCalled();
  });

  it('reject the promise when saveEditTrackerValue event is emitted and an error occurs', async () => {
    const fetchOntology = jest.fn().mockReturnValue([]);
    const expectedError = new Error('Simulated Error');
    const upsertTrackerResource = jest.fn().mockRejectedValue(expectedError);

    const { findByTestId } = render(
      <AdvancedTrackerEditorProvider
        trackTileService={
          {
            datastoreSettings: {},
            fetchOntology,
            upsertTrackerResource
          } as any
        }
        valuesContext={valuesContext}
        tracker={tracker}
        trackerValue={{
          id: 'value',
          createdDate: new Date(),
          code: {
            coding: [
              {
                code: 'detail-coding',
                display: 'detail-coding',
                system: 'detail-coding|system'
              }
            ]
          },
          value: 1
        }}
      />
    );

    await waitFor(() =>
      expect(fetchOntology).toHaveBeenCalledWith(tracker.code)
    );

    const spy = jest.spyOn(notifier, 'addListener').mockClear();

    // Increase Value to trigger a change
    fireEvent.press(await findByTestId('increment-value'));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    expect(
      async () => await new Promise(notifySaveEditTrackerValue)
    ).rejects.toThrowError(expectedError);
  });
});
