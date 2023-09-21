import { useCallback, useEffect, useState, useMemo } from 'react';
import { addDays } from 'date-fns';
import { gql } from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { EHRType, WearablesSyncState } from '../components';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { useGraphQLClient } from './useGraphQLClient';
import { useHttpClient } from './useHttpClient';
import { useFeature } from './useFeature';

const deviceSourceTypes = {
  [EHRType.Fitbit]: 'Fitbit',
  [EHRType.HealthKit]: 'Apple Health',
  [EHRType.GoogleFit]: 'GoogleFit',
  [EHRType.Garmin]: 'Garmin',
};

type DeviceSourceType = keyof typeof deviceSourceTypes;

export const useWearableBackfill = (
  wearablesState: WearablesSyncState | undefined,
) => {
  const [enabledBackfillWearables, setEnabledBackfillWearables] = useState<
    string[]
  >([]);
  const { activeSubject } = useActiveProject();
  const { graphQLClient } = useGraphQLClient();
  const { httpClient } = useHttpClient();
  const { data: isBackfillEnabled } = useFeature('ehrBackfill');
  const { isLoading, accountHeaders } = useActiveAccount();

  const ehrTypes = useMemo(
    () => wearablesState?.items?.map((ehr) => ehr.ehrType as EHRType) ?? [],
    [wearablesState?.items],
  );

  const queryEHRSyncStatus = useCallback(
    () =>
      graphQLClient.request<Response>(
        buildEHRRecordsQueryDocument(ehrTypes),
        {
          patientId: activeSubject?.subjectId,
        },
        accountHeaders,
      ),
    [graphQLClient, ehrTypes, activeSubject?.subjectId, accountHeaders],
  );

  const { data: syncStatus } = useQuery(
    ['backfill-sync-status', ...ehrTypes],
    queryEHRSyncStatus,
    {
      enabled:
        !!activeSubject?.subjectId &&
        !isLoading &&
        ehrTypes.length > 0 &&
        !!isBackfillEnabled,
      select(data) {
        const statuses: Record<string, boolean> = {};

        Object.entries(data.patient).forEach(([key, resources]) => {
          const type = key.split('_')[0];

          statuses[type] =
            (statuses[type] ?? true) &&
            resources !== null &&
            !resources?.edges?.length;
        });

        return statuses;
      },
    },
  );

  useEffect(() => {
    if (!wearablesState?.items?.length || !syncStatus || !isBackfillEnabled) {
      return;
    }

    const updateEnabledBackfillWearables = async () => {
      const backfillSupportedEHRs = wearablesState.items.filter(
        (ehr) => syncStatus?.[ehr.ehrType as DeviceSourceType],
      );

      setEnabledBackfillWearables(
        backfillSupportedEHRs.map((ehr) => ehr.ehrId),
      );
    };

    updateEnabledBackfillWearables();
  }, [wearablesState?.items, syncStatus, isBackfillEnabled]);

  const backfillEHR = useCallback(
    async (ehrId: string) => {
      const ehr = wearablesState?.items.find((item) => item.ehrId === ehrId);

      if (
        ehr?.ehrType === EHRType.HealthKit ||
        !deviceSourceTypes[ehr?.ehrType as DeviceSourceType] ||
        !isBackfillEnabled
      ) {
        return false;
      }

      const end = Date.now();
      const start = addDays(end, -30);

      const createBackfillResponse = await httpClient.post<{
        ingestionId: string;
      }>(`/ehrs/${ehrId}/backfill`, {
        project: activeSubject?.project,
        end: new Date(end).toISOString(),
        start: start.toISOString(),
      });

      return !!createBackfillResponse.data.ingestionId;
    },
    [
      wearablesState?.items,
      isBackfillEnabled,
      httpClient,
      activeSubject?.project,
    ],
  );

  return { enabledBackfillWearables, backfillEHR };
};

const buildEHRRecordsQueryDocument = (types: EHRType[]) => gql`
  query GetEHRRecords($patientId: String) {
    patient(id: $patientId) {
      ${types.map((type) => {
        if (!(type in deviceSourceTypes)) {
          return '';
        }

        const ehrType = type as any as DeviceSourceType;

        return `
          ${type}_Observations: observationsConnection(tag: "${deviceSourceTypes[ehrType]}", first: 1) {
            edges {
              node {
                id
              }
            }
          }
          ${type}_Procedures: proceduresConnection(tag: "${deviceSourceTypes[ehrType]}", first: 1) {
            edges {
              node {
                id
              }
            }
          }
        `;
      })}
    }
  }
`;

type WithSuffix<T extends string, Suffix extends string> = `${T}${Suffix}`;

type Response = {
  patient: {
    [K in WithSuffix<DeviceSourceType, '_Observations' | '_Procedures'>]: {
      edges: {
        node: {
          id: string;
        };
      }[];
    };
  };
};
