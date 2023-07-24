import { AxiosRequestConfig } from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  InstalledMetric,
  TrackTileService,
  TRACKER_CODE_SYSTEM,
  TRACKER_PILLAR_CODE_SYSTEM,
  TrackerValues,
  BulkInstalledMetricSettings,
  TrackerValue,
  TRACK_TILE_CAPABILITIES_VERSION,
  TRACK_TILE_CAPABILITIES_VERSION_HEADER,
  Tracker,
  ContextTrackerValues,
  TrackerValuesContext,
  Code,
  CodedRelationship,
} from '../services/TrackTileService';
import {
  startOfDay,
  eachDayOfInterval,
  endOfDay,
  min as minDate,
  max as maxDate,
  differenceInSeconds,
} from 'date-fns';
import { pick, merge, pickBy, omit, fromPairs } from 'lodash';
import { useHttpClient } from '../../../hooks/useHttpClient';
import { useActiveAccount } from './../../../hooks/useActiveAccount';
import { useActiveProject } from './../../../hooks/useActiveProject';
import { useUser } from '../../../hooks/useUser';

const axiosConfig = (obj: { account: string }): AxiosRequestConfig => ({
  headers: {
    'LifeOmic-Account': obj.account,
    [TRACK_TILE_CAPABILITIES_VERSION_HEADER]: TRACK_TILE_CAPABILITIES_VERSION,
  },
});

export const useAxiosTrackTileService = (): TrackTileService => {
  const { httpClient } = useHttpClient();
  const { activeSubjectId: patientId, activeProject } = useActiveProject();
  const { account } = useActiveAccount();
  const { data: userData } = useUser();
  const userId = userData?.id;
  const [previousUserId, setPreviousUserId] = useState(userId);

  const accountId = account?.id || '';
  const projectId = activeProject?.id || '';

  const { current: cache } = useRef<{
    trackers?: Tracker[];
    trackerValues: ContextTrackerValues;
    ontologies: Record<string, CodedRelationship[]>;
  }>({ trackerValues: {}, ontologies: {} });

  // Clear cached trackers when
  // we've detected that the userId has changed
  useEffect(() => {
    if (userId !== previousUserId) {
      cache.trackers = undefined;
      cache.trackerValues = {};
      cache.ontologies = {};
      setPreviousUserId(userId);
    }
  }, [userId, cache, previousUserId]);

  const updateSettingsInCache = (settings: BulkInstalledMetricSettings) => {
    const tracker = cache.trackers?.find(
      ({ id, metricId }) => (metricId ?? id) === settings.metricId,
    );

    if (!tracker) {
      return;
    }

    const newSettings = pick(settings, ['order', 'target', 'unit', 'metricId']);
    const mergedTracker = merge({}, tracker, newSettings);

    cache.trackers = (cache.trackers ?? [])
      ?.filter(({ metricId }) => metricId !== mergedTracker.metricId)
      .concat(mergedTracker);

    return mergedTracker;
  };

  const getCachedValues = (valuesContext: TrackerValuesContext) => {
    const valuesContextKey = `${valuesContext.system}|${valuesContext.codeBelow}`;
    if (!cache.trackerValues[valuesContextKey]) {
      cache.trackerValues[valuesContextKey] = {};
    }
    return cache.trackerValues[valuesContextKey];
  };

  return {
    accountId,
    projectId,
    patientId,

    fetchTrackers: async () => {
      if (cache.trackers) {
        return cache.trackers;
      }

      const queryParams = {
        project: projectId,
      };
      const params = Object.entries(pickBy(queryParams))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

      const url = `/v1/track-tiles/trackers${params && `?${params}`}`;

      const res = await httpClient.get(
        url,
        axiosConfig({ account: accountId }),
      );
      const fetchedTrackers: Tracker[] = res.data;

      cache.trackers = fetchedTrackers;

      return fetchedTrackers;
    },

    upsertTracker: async (metricId, settings) => {
      const res = await httpClient.put<InstalledMetric>(
        `/v1/track-tiles/metrics/installs/${metricId}`,
        settings,
        axiosConfig({ account: accountId }),
      );

      return updateSettingsInCache(res.data) || res.data;
    },

    upsertTrackers: async (settings) => {
      await httpClient.patch(
        '/v1/track-tiles/metrics/installs',
        settings,
        axiosConfig({ account: accountId }),
      );

      settings.forEach(updateSettingsInCache);
    },

    uninstallTracker: async (metricId) => {
      await httpClient.delete(
        `/v1/track-tiles/metrics/installs/${metricId}`,
        axiosConfig({ account: accountId }),
      );

      cache.trackers = cache.trackers?.map((t) => {
        if (t.metricId === metricId) {
          return {
            ...omit(t, ['target', 'unit', 'metricId']),
            id: metricId,
          };
        }
        return t;
      });
    },

    fetchTrackerValues: async (valuesContext, interval) => {
      const cached = getCachedValues(valuesContext);
      const dayRange = eachDayOfInterval(interval);
      const missingDays = dayRange.filter((day) => !(toDateKey(day) in cached));

      if (missingDays.length === 0) {
        return pick(cached, toDateKeys(dayRange));
      }

      const missingStart = minDate(missingDays);
      const missingEnd = endOfDay(maxDate(missingDays));
      const start = maxDate([missingStart, interval.start]).toISOString();
      const end = minDate([missingEnd, interval.end]).toISOString();

      const res = await httpClient.post<FetchTrackerResponse>(
        '/v1/graphql',
        {
          variables: {
            dates: [`ge${start}`, `le${end}`],
            codeBelow: valuesContext.codeBelow,
            patientId,
          },
          query: FETCH_TRACKER_VALUES_BY_DATES_QUERY,
        },
        axiosConfig({ account: accountId }),
      );

      const trackerValues = extractTrackerValues(res.data);
      Object.assign(
        cached,
        fromPairs(toDateKeys(missingDays).map((d) => [d, {}])),
        trackerValues,
      );
      return pick(cached, toDateKeys(dayRange));
    },

    deleteTrackerResource: async (valuesContext, resourceType, id) => {
      const res = await httpClient.post<DeleteResourceResponse>(
        '/v1/graphql',
        {
          query: DELETE_RESOURCE(resourceType),
          variables: { id },
        },
        axiosConfig({ account: accountId }),
      );

      if (!res.data.data) {
        throw new Error('An error occurred while deleting the TrackerResource');
      }

      if (res.data.data.success) {
        const cached = getCachedValues(valuesContext);
        Object.entries(cached).forEach(([dateKey, metricValues]) => {
          Object.entries(metricValues).forEach(([metricKey, trackerValues]) => {
            cached[dateKey][metricKey] = trackerValues.filter(
              (trackerValue) => trackerValue.id !== id,
            );
          });
        });
      }

      return res.data.data.success;
    },

    upsertTrackerResource: async (valuesContext, resource) => {
      const res = await httpClient.post<
        UpsertObservationResponse | UpsertProcedureResponse
      >(
        '/v1/graphql',
        {
          query:
            resource.resourceType === 'Observation'
              ? MUTATE_OBSERVATION_RESOURCE(resource.id ? 'Update' : 'Create')
              : MUTATE_PROCEDURE_RESOURCE(resource.id ? 'Update' : 'Create'),
          variables: { resource },
        },
        axiosConfig({ account: accountId }),
      );

      if (!res.data.data) {
        throw new Error('Failed to upsert the TrackerResource');
      }

      const resourceCoding = extractMetricCoding(resource.code.coding);
      let trackerValue: TrackerValue;
      let resourceDateKey: string;

      if (resource.resourceType === 'Observation') {
        const modifiedResource = res.data.data.resource as Observation['node'];
        resourceDateKey = toDateKey(resource.effectiveDateTime);

        trackerValue = {
          ...resource,
          id: modifiedResource.id,
          createdDate: new Date(modifiedResource.effectiveDateTime),
          value: modifiedResource.valueQuantity.value || 0,
        };
      } else {
        const modifiedResource = res.data.data.resource as Procedure['node'];
        resourceDateKey = toDateKey(resource.performedPeriod.end);
        const resourceValue = performedPeriodToTimeInSeconds(
          resource.performedPeriod,
        );

        trackerValue = {
          ...resource,
          id: modifiedResource.id,
          createdDate: new Date(modifiedResource.performedPeriod.end),
          value: resourceValue,
        };
      }

      if (resourceCoding && resourceDateKey) {
        const cached = getCachedValues(valuesContext);

        if (!cached[resourceDateKey]) {
          cached[resourceDateKey] = {};
        }

        cached[resourceDateKey][resourceCoding.code] = [
          ...(cached[resourceDateKey][resourceCoding.code] ?? []).filter(
            (v) => v.id !== trackerValue.id,
          ),
          trackerValue,
        ];
      }

      return trackerValue;
    },

    fetchOntology: async (codeBelow: string) => {
      const cachedData = cache.ontologies[codeBelow];
      if (cachedData) {
        return cachedData;
      }

      const res = await httpClient.post<QueryOntologyResponse>(
        '/v1/graphql',
        {
          query: QUERY_ONTOLOGY,
          variables: {
            project: projectId,
            code: codeBelow,
          },
        },
        axiosConfig({ account: accountId }),
      );

      if (!res.data.data) {
        throw new Error('Failed to fetch the Ontology');
      }

      const parseRelationship = (
        relationship: CodeNode['relationshipConnection'],
      ): CodedRelationship[] => {
        if (!relationship) {
          return [];
        }

        return relationship.edges.map(
          ({ node: { relationshipConnection, ...rest } }) => ({
            ...rest,
            specializedBy: parseRelationship(relationshipConnection),
          }),
        );
      };

      const data = parseRelationship(res.data.data.searchCodings);

      cache.ontologies[codeBelow] = data;

      return data;
    },
  };
};

export const extractTrackerValues = (data: FetchTrackerResponse) => {
  const patient = data.data.patient;
  const observations = patient?.observationsConnection?.edges ?? [];
  const procedures = patient?.proceduresConnection?.edges ?? [];

  const trackerValues: TrackerValues = {};

  observations.forEach(({ node: observation }) => {
    const observationDateKey = toDateKey(observation.effectiveDateTime);

    trackerValues[observationDateKey] = trackerValues[observationDateKey] ?? {};

    const metricId = extractMetricId(observation.code.coding);

    if (metricId) {
      trackerValues[observationDateKey][metricId] =
        trackerValues[observationDateKey][metricId] ?? [];

      trackerValues[observationDateKey][metricId].push({
        id: observation.id,
        createdDate: new Date(observation.effectiveDateTime),
        value: observation.valueQuantity.value,
        code: observation.code,
      });
    }
  });

  procedures.forEach(({ node: procedure }) => {
    const procedureDateKey = toDateKey(procedure.performedPeriod.end);

    trackerValues[procedureDateKey] = trackerValues[procedureDateKey] ?? {};

    const metricId = extractMetricId(procedure.code.coding);

    if (metricId) {
      trackerValues[procedureDateKey][metricId] =
        trackerValues[procedureDateKey][metricId] ?? [];

      trackerValues[procedureDateKey][metricId].push({
        id: procedure.id,
        createdDate: new Date(procedure.performedPeriod.end),
        value: performedPeriodToTimeInSeconds(procedure.performedPeriod),
        code: procedure.code,
      });
    }
  });

  return trackerValues;
};

export const extractMetricId = (codes: Observation['node']['code']['coding']) =>
  extractMetricCoding(codes)?.code;

export const extractMetricCoding = (
  codes: Observation['node']['code']['coding'],
) =>
  codes.find(
    ({ system }) =>
      system === TRACKER_CODE_SYSTEM || system === TRACKER_PILLAR_CODE_SYSTEM,
  );

const toDateKeys = (dates: Date[]) => dates.map(toDateKey);
export const toDateKey = (date: string | Date) =>
  startOfDay(new Date(date)).toUTCString();

const performedPeriodToTimeInSeconds = (
  performedPeriod: Procedure['node']['performedPeriod'],
): number => {
  const start = new Date(performedPeriod.start);
  const end = new Date(performedPeriod.end);

  return Math.abs(differenceInSeconds(start, end)) || 0;
};

export type FetchTrackerResponse = {
  data: {
    patient: {
      observationsConnection: {
        edges: Observation[];
      };
      proceduresConnection: {
        edges: Procedure[];
      };
    };
  };
};

export type Observation = {
  node: {
    id: string;
    effectiveDateTime: string;
    code: {
      coding: Code[];
    };
    valueQuantity: {
      value: number;
    };
  };
};

export type Procedure = {
  node: {
    id: string;
    code: {
      coding: Code[];
    };
    performedPeriod: {
      start: string;
      end: string;
    };
  };
};

export const FETCH_TRACKER_VALUES_BY_DATES_QUERY = `
query GetObservations($dates: [String!], $codeBelow: String!, $patientId: String) {
  patient(id: $patientId) {
    observationsConnection(dates: $dates, codeBelow: $codeBelow) {
      edges {
        node {
          id
          effectiveDateTime
          code {
            coding {
              system
              code
              id
              display
            }
          }
          valueQuantity {
            value
          }
        }
      }
    }
    proceduresConnection(dates: $dates, codeBelow: $codeBelow) {
      edges {
        node {
          id
          code {
            coding {
              system
              code
              id
              display
            }
          }
          performedPeriod {
            start
            end
          }
        }
      }
    }
  }
}
`;

export type UpsertObservationResponse = {
  data: {
    resource: Pick<
      Observation['node'],
      'id' | 'effectiveDateTime' | 'valueQuantity'
    >;
  };
};

export const MUTATE_OBSERVATION_RESOURCE = (mutation: 'Create' | 'Update') => `
mutation ${mutation}Observation($resource: ObservationIn!) {
  resource: ${mutation.toLowerCase()}Observation (observation: $resource) {
    id
    effectiveDateTime
    valueQuantity {
      value
    }
  }
}
`;

export type UpsertProcedureResponse = {
  data: {
    resource: Pick<Procedure['node'], 'id' | 'performedPeriod'>;
  };
};

export const MUTATE_PROCEDURE_RESOURCE = (mutation: 'Create' | 'Update') => `
mutation ${mutation}Procedure($resource: ProcedureIn!) {
  resource: ${mutation.toLowerCase()}Procedure (procedure: $resource) {
    id
    performedPeriod {
      start
      end
    }
  }
}
`;

type CodeNode = Code & {
  relationshipConnection: {
    edges: {
      node: CodeNode;
    }[];
  };
};

export type QueryOntologyResponse = {
  data: {
    searchCodings: {
      edges: {
        node: CodeNode;
      }[];
    };
  };
};

export const QUERY_ONTOLOGY = `
query fetchOntology($project: String!, $code: String!) {
  searchCodings(project: $project, code: $code, relationship: SPECIALIZES, sort: "display") {
    edges {
      node {
        id
        code
        system
        display
        educationContent {
          description
          thumbnail
          url
        }
        relationshipConnection(relationship: SPECIALIZES) {
          edges {
            node {
              id
              code
              system
              display
              educationContent {
                description
                thumbnail
                url
              }
              relationshipConnection(relationship: SPECIALIZES) {
                edges {
                  node {
                    id
                    code
                    system
                    display
                    educationContent {
                      description
                      thumbnail
                      url
                    }
                    relationshipConnection(relationship: SPECIALIZES) {
                      edges {
                        node {
                          id
                          code
                          system
                          display
                          educationContent {
                            description
                            thumbnail
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

export type DeleteResourceResponse = {
  data: {
    success: boolean;
  };
};

export const DELETE_RESOURCE = (type: Tracker['resourceType']) => `
mutation delete${type}($id: String!) {
  success: delete${type}(id: $id)
}
`;
