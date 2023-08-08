import { renderHook, act } from '@testing-library/react-native';
import { addSeconds, endOfDay, startOfDay, subSeconds } from 'date-fns';
import {
  BulkInstalledMetricSettings,
  InstalledMetric,
  MetricType,
  Tracker,
  TrackerResource,
  TrackerValuesContext,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from '../../services/TrackTileService';
import {
  MUTATE_OBSERVATION_RESOURCE,
  FETCH_TRACKER_VALUES_BY_DATES_QUERY,
  useAxiosTrackTileService,
  MUTATE_PROCEDURE_RESOURCE,
  DELETE_RESOURCE,
} from '../useAxiosTrackTileService';
import { refreshNotifier } from '../../../../common/RefreshNotifier';
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const valuesContext: TrackerValuesContext = {
  system: TRACKER_CODE_SYSTEM,
  codeBelow: TRACKER_CODE,
};

const DATASTORE_HEADERS = {
  headers: expect.objectContaining({
    'LifeOmic-TrackTile-Capabilities-Version': 2,
    'LifeOmic-Account': 'account-id',
  }),
};

const ACCOUNT_HEADERS = {
  headers: expect.objectContaining({
    'LifeOmic-TrackTile-Capabilities-Version': 2,
    'LifeOmic-Account': 'account-id',
  }),
};

const getMock = jest.fn();
const putMock = jest.fn();
const patchMock = jest.fn();
const postMock = jest.fn();
const deleteMock = jest.fn();

jest.mock('../../../../hooks/useHttpClient', () => ({
  useHttpClient: () => ({
    httpClient: {
      get: getMock,
      put: putMock,
      patch: patchMock,
      post: postMock,
      delete: deleteMock,
    },
  }),
}));

jest.mock('../../../../hooks/useActiveAccount', () => ({
  useActiveAccount: () => ({
    account: { id: 'account-id' },
  }),
}));

jest.mock('../../../../hooks/useActiveProject', () => ({
  useActiveProject: () => ({
    activeProject: { id: 'project-id' },
    activeSubjectId: 'patient-id',
  }),
}));

jest.mock('../../../../hooks/useUser', () => ({
  useUser: () => ({
    data: { id: 'mockUser' },
  }),
}));

const renderHookInContext = () => {
  return renderHook(() => useAxiosTrackTileService(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    ),
  });
};

describe('useAxiosTrackTileService', () => {
  it('should return the same values for accountSettings', () => {
    const { result } = renderHookInContext();

    expect(result.current).toEqual(
      expect.objectContaining({
        accountId: 'account-id',
        projectId: 'project-id',
      }),
    );
  });

  it('should fetch the track tile trackers when calling fetchTrackers', async () => {
    getMock.mockResolvedValue({ data: [{ id: 'metric-id' }] });

    const { result } = renderHookInContext();

    let returnedMetrics: any;
    await act(async () => {
      returnedMetrics = await result.current.fetchTrackers();
    });

    expect(getMock).toHaveBeenCalledWith(
      '/v1/track-tiles/trackers?project=project-id',
      DATASTORE_HEADERS,
    );
    expect(returnedMetrics).toEqual([{ id: 'metric-id' }]);
  });

  it('should cache trackers and only call the api once', async () => {
    getMock.mockResolvedValue({ data: [{ id: 'metric-id' }] });

    const { result } = renderHookInContext();

    let first: any, second: any;
    await act(async () => {
      first = await result.current.fetchTrackers();
      second = await result.current.fetchTrackers();
    });

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('should fetch the trackers on a project when calling fetchTrackers when a project is provided', async () => {
    getMock.mockResolvedValue({ data: [{ id: 'metric-id' }] });

    const { result } = renderHookInContext();

    let returnedTrackers: any;
    await act(async () => {
      returnedTrackers = await result.current.fetchTrackers();
    });

    expect(getMock).toHaveBeenCalledWith(
      '/v1/track-tiles/trackers?project=project-id',
      ACCOUNT_HEADERS,
    );
    expect(returnedTrackers).toEqual([{ id: 'metric-id' }]);
  });

  it('should request the public trackers when fetching trackers with includePublic set to true', async () => {
    getMock.mockResolvedValue({ data: [] });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.fetchTrackers();
    });

    expect(getMock).toHaveBeenCalledWith(
      '/v1/track-tiles/trackers?project=project-id',
      DATASTORE_HEADERS,
    );
  });

  it('should include public and project only trackers when requested', async () => {
    getMock.mockResolvedValue({ data: [] });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.fetchTrackers();
    });

    expect(getMock).toHaveBeenCalledWith(
      '/v1/track-tiles/trackers?project=project-id',
      ACCOUNT_HEADERS,
    );
  });

  it('should upsert the tracker install settings when calling upsertTracker and return the new value', async () => {
    const settings: BulkInstalledMetricSettings = {
      metricId: 'metric-id',
      order: 1,
      target: 2,
      unit: '3',
    };
    putMock.mockResolvedValue({ data: settings });

    const { result } = renderHookInContext();

    let upsertResult: any;
    await act(async () => {
      upsertResult = await result.current.upsertTracker(
        settings.metricId,
        settings,
      );
    });

    expect(putMock).toHaveBeenCalledWith(
      '/v1/track-tiles/metrics/installs/metric-id',
      settings,
      DATASTORE_HEADERS,
    );
    expect(upsertResult).toEqual(settings);
  });

  it('should update settings in the cache when calling upsertTracker', async () => {
    const settings: Partial<InstalledMetric> & BulkInstalledMetricSettings = {
      metricId: 'metric-id',
      color: 'red',
      order: 1,
      target: 2,
      unit: '3',
    };
    putMock.mockResolvedValue({ data: { ...settings, order: 2 } }); // update res
    getMock.mockResolvedValue({ data: [settings] }); // initial value

    const { result } = renderHookInContext();

    let cachedResult: any;
    await act(async () => {
      // populate cache
      await result.current.fetchTrackers();
      // update settings
      await result.current.upsertTracker(settings.metricId, {
        ...settings,
        order: 2,
      });
      // fetch trackers from cache
      cachedResult = await result.current.fetchTrackers();
    });

    expect(cachedResult).toEqual([
      {
        ...settings,
        order: 2, // cached value has been updated
      },
    ]);
  });

  it('should update settings in the cache and use the metric settings when adding a new tracker when calling upsertTracker', async () => {
    const settings: Partial<MetricType> & BulkInstalledMetricSettings = {
      metricId: 'metric-id',
      id: 'metric-id',
      color: 'red',
      order: 1,
      target: 2,
      unit: '3',
    };
    putMock.mockResolvedValue({ data: { ...settings, order: 2 } }); // update res
    getMock.mockResolvedValue({ data: [settings] }); // initial value

    const { result } = renderHookInContext();

    let cachedResult: any;
    await act(async () => {
      // populate cache
      await result.current.fetchTrackers();
      // update settings
      await result.current.upsertTracker(settings.metricId, {
        ...settings,
        order: 2,
      });
      // fetch trackers from cache
      cachedResult = await result.current.fetchTrackers();
    });

    expect(cachedResult).toEqual([
      {
        ...settings,
        order: 2, // cached value has been updated
      },
    ]);
  });

  it('should upsert multiple trackers settings when calling upsertTrackers and update in the cache', async () => {
    const tracker1: Partial<Tracker> = { id: 'a', metricId: '1', order: 1 };
    const tracker2: Partial<Tracker> = { id: 'b', metricId: '2', order: 2 };
    const updatedSettings = [
      { ...tracker2, order: 1 },
      { ...tracker1, order: 2 },
    ];

    patchMock.mockResolvedValue({ data: updatedSettings });
    getMock.mockResolvedValue({ data: [tracker1, tracker2] });

    const { result } = renderHookInContext();

    let cachedResult: any;
    await act(async () => {
      // populate cache
      await result.current.fetchTrackers();
      // update trackers
      await result.current.upsertTrackers(updatedSettings as any);
      // fetch trackers from cache
      cachedResult = await result.current.fetchTrackers();
    });

    expect(putMock).toHaveBeenCalledWith(
      '/v1/track-tiles/metrics/installs',
      updatedSettings,
      ACCOUNT_HEADERS,
    );
    expect(cachedResult).toEqual(updatedSettings);
  });

  it('should query for tracker values based on an interval of days', async () => {
    postMock.mockResolvedValue(
      toGraphQLResult(
        [
          {
            metricId: 'metric-id-1',
            effectiveDateTime: '2021-07-23',
            value: 1,
          },
        ],
        [
          {
            metricId: 'metric-id-2',
            effectiveDateTime: '2021-07-23',
            value: 3,
          },
        ],
      ),
    );

    const { result } = renderHookInContext();

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchTrackerValues(valuesContext, {
        start: new Date('2021-07-23'),
        end: new Date('2021-07-30'),
      });
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        variables: {
          dates: ['ge2021-07-23T00:00:00.000Z', 'le2021-07-30T00:00:00.000Z'],
          patientId: 'patient-id',
          codeBelow: valuesContext.codeBelow,
        },
        query: FETCH_TRACKER_VALUES_BY_DATES_QUERY,
      },
      DATASTORE_HEADERS,
    );
    expect(fetchResult).toEqual({
      [startOfDay(new Date('2021-07-24')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-25')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-26')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-27')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-28')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-29')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-30')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-23')).toUTCString()]: {
        'metric-id-1': [
          {
            id: 'observation-0',
            createdDate: new Date('2021-07-23'),
            value: 1,
            code: {
              coding: [
                {
                  code: 'metric-id-1',
                  system: 'http://lifeomic.com/fhir/track-tile-value',
                },
              ],
            },
          },
        ],
        'metric-id-2': [
          {
            id: 'procedure-0',
            createdDate: new Date('2021-07-23'),
            value: 3,
            code: {
              coding: [
                {
                  code: 'metric-id-2',
                  system: 'http://lifeomic.com/fhir/track-tile-value',
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('should query for tracker values based on an interval of days and custom codeBelow', async () => {
    postMock.mockResolvedValue(
      toGraphQLResult(
        [
          {
            metricId: 'metric-id-1',
            effectiveDateTime: '2021-07-23',
            value: 1,
          },
        ],
        [
          {
            metricId: 'metric-id-2',
            effectiveDateTime: '2021-07-23',
            value: 3,
          },
        ],
      ),
    );

    const { result } = renderHookInContext();

    const customValuesContext = {
      ...valuesContext,
      codeBelow: 'custom-code-below',
    };

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchTrackerValues(
        customValuesContext,
        {
          start: new Date('2021-07-23'),
          end: new Date('2021-07-30'),
        },
      );
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        variables: {
          dates: ['ge2021-07-23T00:00:00.000Z', 'le2021-07-30T00:00:00.000Z'],
          codeBelow: customValuesContext.codeBelow,
          patientId: 'patient-id',
        },
        query: FETCH_TRACKER_VALUES_BY_DATES_QUERY,
      },
      DATASTORE_HEADERS,
    );
    expect(fetchResult).toEqual({
      [startOfDay(new Date('2021-07-24')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-25')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-26')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-27')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-28')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-29')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-30')).toUTCString()]: {},
      [startOfDay(new Date('2021-07-23')).toUTCString()]: {
        'metric-id-1': [
          {
            id: 'observation-0',
            createdDate: new Date('2021-07-23'),
            value: 1,
            code: {
              coding: [
                {
                  code: 'metric-id-1',
                  system: 'http://lifeomic.com/fhir/track-tile-value',
                },
              ],
            },
          },
        ],
        'metric-id-2': [
          {
            id: 'procedure-0',
            createdDate: new Date('2021-07-23'),
            value: 3,
            code: {
              coding: [
                {
                  code: 'metric-id-2',
                  system: 'http://lifeomic.com/fhir/track-tile-value',
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('should only query for a range of days that include the uncached days', async () => {
    postMock
      .mockResolvedValueOnce(
        toGraphQLResult([
          {
            metricId: 'metric-id-1',
            effectiveDateTime: '2021-07-23',
            value: 1,
          },
        ]),
      )
      .mockResolvedValueOnce(
        toGraphQLResult([
          {
            metricId: 'metric-id-1',
            effectiveDateTime: '2021-07-24',
            value: 2,
          },
        ]),
      );

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.fetchTrackerValues(valuesContext, {
        start: startOfDay(new Date('2021-07-23')),
        end: endOfDay(new Date('2021-07-23')),
      });
      await result.current.fetchTrackerValues(valuesContext, {
        start: startOfDay(new Date('2021-07-23')),
        end: endOfDay(new Date('2021-07-24')),
      });
    });

    expect(postMock).toHaveBeenNthCalledWith(
      1,
      '/v1/graphql',
      {
        variables: {
          dates: [
            `ge${startOfDay(new Date('2021-07-23')).toISOString()}`,
            `le${endOfDay(new Date('2021-07-23')).toISOString()}`,
          ],
          patientId: 'patient-id',
          codeBelow: valuesContext.codeBelow,
        },
        query: FETCH_TRACKER_VALUES_BY_DATES_QUERY,
      },
      DATASTORE_HEADERS,
    );
    expect(postMock).toHaveBeenNthCalledWith(
      2,
      '/v1/graphql',
      {
        variables: {
          dates: [
            `ge${startOfDay(new Date('2021-07-24')).toISOString()}`,
            `le${endOfDay(new Date('2021-07-24')).toISOString()}`,
          ],
          patientId: 'patient-id',
          codeBelow: valuesContext.codeBelow,
        },
        query: FETCH_TRACKER_VALUES_BY_DATES_QUERY,
      },
      DATASTORE_HEADERS,
    );
  });

  it('should return cached data if all days are present in the cache', async () => {
    postMock.mockResolvedValueOnce(
      toGraphQLResult([
        {
          metricId: 'metric-id-1',
          effectiveDateTime: '2021-07-23',
          value: 1,
        },
        {
          metricId: 'metric-id-1',
          effectiveDateTime: '2021-07-24',
          value: 2,
        },
      ]),
    );

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.fetchTrackerValues(valuesContext, {
        start: startOfDay(new Date('2021-07-23')),
        end: endOfDay(new Date('2021-07-24')),
      });
      await result.current.fetchTrackerValues(valuesContext, {
        start: startOfDay(new Date('2021-07-24')),
        end: endOfDay(new Date('2021-07-24')),
      });
    });

    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('should return cached pillars data if all days are present in the cache', async () => {
    postMock.mockResolvedValueOnce(
      toGraphQLResult([
        {
          metricId: 'metric-id-1',
          effectiveDateTime: '2021-07-23',
          value: 1,
        },
        {
          metricId: 'metric-id-1',
          effectiveDateTime: '2021-07-24',
          value: 2,
        },
      ]),
    );

    const { result } = renderHookInContext();

    const pillarValuesContext = {
      system: TRACKER_PILLAR_CODE_SYSTEM,
      codeBelow: TRACKER_PILLAR_CODE,
    };

    await act(async () => {
      await result.current.fetchTrackerValues(pillarValuesContext, {
        start: startOfDay(new Date('2021-07-23')),
        end: endOfDay(new Date('2021-07-24')),
      });
      await result.current.fetchTrackerValues(pillarValuesContext, {
        start: startOfDay(new Date('2021-07-24')),
        end: endOfDay(new Date('2021-07-24')),
      });
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenNthCalledWith(
      1,
      '/v1/graphql',
      {
        variables: {
          dates: [
            `ge${startOfDay(new Date('2021-07-23')).toISOString()}`,
            `le${endOfDay(new Date('2021-07-24')).toISOString()}`,
          ],
          patientId: 'patient-id',
          codeBelow: pillarValuesContext.codeBelow,
        },
        query: FETCH_TRACKER_VALUES_BY_DATES_QUERY,
      },
      DATASTORE_HEADERS,
    );
  });

  it('should create a new observation if there is no resource.id', async () => {
    const newResource: TrackerResource = {
      code: {
        coding: [
          {
            system: TRACKER_CODE_SYSTEM,
            code: 'metric-id-1',
            display: 'test',
          },
        ],
      },
      effectiveDateTime: startOfDay(new Date('2021-07-23')).toISOString(),
      meta: {
        tag: [],
      },
      resourceType: 'Observation',
      valueQuantity: {
        value: 1,
        code: '',
        system: '',
        unit: '',
      },
      status: 'final',
    };
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          resource: toObservation({
            metricId: 'metric-id-1',
            effectiveDateTime: startOfDay(new Date('2021-07-23')).toISOString(),
            value: 1,
          }),
        },
      },
    });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.upsertTrackerResource(valuesContext, newResource);
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        query: MUTATE_OBSERVATION_RESOURCE('Create'),
        variables: { resource: newResource },
      },
      DATASTORE_HEADERS,
    );
  });

  it('should update an observation if the resource.id is present', async () => {
    const newResource: TrackerResource = {
      id: 'existing',
      code: {
        coding: [],
      },
      effectiveDateTime: startOfDay(new Date('2021-07-23')).toISOString(),
      meta: {
        tag: [],
      },
      resourceType: 'Observation',
      valueQuantity: {
        value: 1,
        code: '',
        system: '',
        unit: '',
      },
      status: 'completed',
    };
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          resource: toObservation({
            metricId: 'metric-id-1',
            effectiveDateTime: startOfDay(new Date('2021-07-23')).toISOString(),
            value: 1,
          }),
        },
      },
    });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.upsertTrackerResource(valuesContext, newResource);
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        query: MUTATE_OBSERVATION_RESOURCE('Update'),
        variables: { resource: newResource },
      },
      DATASTORE_HEADERS,
    );
  });

  it('should create a new procedure if there is no resource.id', async () => {
    const newResource: TrackerResource = {
      code: {
        coding: [
          {
            system: TRACKER_CODE_SYSTEM,
            code: 'metric-id-1',
            display: 'test',
          },
        ],
      },
      meta: {
        tag: [],
      },
      resourceType: 'Procedure',
      performedPeriod: {
        start: startOfDay(new Date('2021-07-23')).toISOString(),
        end: addSeconds(startOfDay(new Date('2021-07-23')), 4).toISOString(),
      },
      status: 'completed',
    };
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          resource: toProcedure({
            metricId: 'metric-id-1',
            effectiveDateTime: startOfDay(new Date('2021-07-23')).toISOString(),
            value: 4,
          }),
        },
      },
    });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.upsertTrackerResource(valuesContext, newResource);
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        query: MUTATE_PROCEDURE_RESOURCE('Create'),
        variables: { resource: newResource },
      },
      DATASTORE_HEADERS,
    );
  });

  it('should update a procedure if the resource.id is present', async () => {
    const newResource: TrackerResource = {
      id: 'existing',
      code: {
        coding: [
          {
            system: TRACKER_CODE_SYSTEM,
            code: 'metric-id-1',
            display: 'test',
          },
        ],
      },
      meta: {
        tag: [],
      },
      resourceType: 'Procedure',
      performedPeriod: {
        start: startOfDay(new Date('2021-07-23')).toISOString(),
        end: addSeconds(startOfDay(new Date('2021-07-23')), 4).toISOString(),
      },
      status: 'completed',
    };
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          resource: toProcedure({
            metricId: 'metric-id-1',
            effectiveDateTime: startOfDay(new Date('2021-07-23')).toISOString(),
            value: 4,
          }),
        },
      },
    });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.upsertTrackerResource(valuesContext, newResource);
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        query: MUTATE_PROCEDURE_RESOURCE('Update'),
        variables: { resource: newResource },
      },
      DATASTORE_HEADERS,
    );
  });

  it('should throw an error if the query result does not contain any data', async () => {
    postMock.mockResolvedValueOnce({ data: {} });

    const { result } = renderHookInContext();

    await expect(
      result.current.upsertTrackerResource(valuesContext, {
        resourceType: 'Observation',
      } as any),
    ).rejects.toThrowError('Failed to upsert the TrackerResource');
  });

  it('should delete a procedure when calling deleteTrackerResource', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          success: true,
        },
      },
    });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.deleteTrackerResource(
        valuesContext,
        'Procedure',
        'procedureId',
      );
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        query: DELETE_RESOURCE('Procedure'),
        variables: { id: 'procedureId' },
      },
      DATASTORE_HEADERS,
    );
  });

  it('should delete an observation when calling deleteTrackerResource', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          success: true,
        },
      },
    });

    const { result } = renderHookInContext();

    await act(async () => {
      await result.current.deleteTrackerResource(
        valuesContext,
        'Observation',
        'observationId',
      );
    });

    expect(postMock).toHaveBeenCalledWith(
      '/v1/graphql',
      {
        query: DELETE_RESOURCE('Observation'),
        variables: { id: 'observationId' },
      },
      DATASTORE_HEADERS,
    );
  });

  it('should clear pillar values cache upon refresh', async () => {
    postMock.mockResolvedValue(
      toGraphQLResult([
        {
          metricId: 'metric-id-1',
          effectiveDateTime: '2021-07-23',
          value: 1,
        },
        {
          metricId: 'metric-id-1',
          effectiveDateTime: '2021-07-24',
          value: 2,
        },
      ]),
    );

    const { result } = renderHook(() => useAxiosTrackTileService());

    const pillarValuesContext = {
      system: TRACKER_PILLAR_CODE_SYSTEM,
      codeBelow: TRACKER_PILLAR_CODE,
    };

    await act(async () => {
      await result.current.fetchTrackerValues(pillarValuesContext, {
        start: startOfDay(new Date('2021-07-23')),
        end: endOfDay(new Date('2021-07-24')),
      });
      refreshNotifier.emit({ context: 'HomeScreen' });
      await result.current.fetchTrackerValues(pillarValuesContext, {
        start: startOfDay(new Date('2021-07-23')),
        end: endOfDay(new Date('2021-07-24')),
      });
    });

    expect(postMock).toHaveBeenCalledTimes(2);
  });
});

type GraphQlValue = {
  effectiveDateTime: string;
  value: number;
  metricId: string;
};

const toObservation = (value: GraphQlValue, id?: string) => ({
  id,
  effectiveDateTime: value.effectiveDateTime,
  valueQuantity: {
    value: value.value,
  },
  code: {
    coding: [
      {
        code: value.metricId,
        system: TRACKER_CODE_SYSTEM,
      },
    ],
  },
  status: 'final',
});

const toProcedure = (value: GraphQlValue, id?: string) => ({
  id,
  performedPeriod: {
    start: subSeconds(
      new Date(value.effectiveDateTime),
      value.value,
    ).toISOString(),
    end: value.effectiveDateTime,
  },
  code: {
    coding: [
      {
        code: value.metricId,
        system: TRACKER_CODE_SYSTEM,
      },
    ],
  },
  status: 'completed',
});

const toGraphQLResult = (
  observationValues: GraphQlValue[],
  procedureValues: GraphQlValue[] = [],
) => ({
  data: {
    data: {
      patient: {
        observationsConnection: {
          edges: observationValues.map((value, id) => ({
            node: toObservation(value, `observation-${id}`),
          })),
        },
        proceduresConnection: {
          edges: procedureValues.map((value, id) => ({
            node: toProcedure(value, `procedure-${id}`),
          })),
        },
      },
    },
  },
});
