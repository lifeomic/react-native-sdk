import { useCallback, useEffect, useState, useMemo } from 'react';
import { addDays } from 'date-fns';
import { gql } from 'graphql-request';
import { useQuery } from 'react-query';
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
  const { activeProject, activeSubjectId } = useActiveProject();
  const { graphQLClient } = useGraphQLClient();
  const { httpClient } = useHttpClient();
  const { data: isBackfillEnabled } = useFeature('ehrBackfill');
  const { isFetched, accountHeaders } = useActiveAccount();

  const ehrTypes = useMemo(
    () => wearablesState?.items?.map((ehr) => ehr.ehrType as EHRType) ?? [],
    [wearablesState?.items],
  );

  const queryEHRSyncStatus = useCallback(
    () =>
      graphQLClient.request<Response>(
        buildEHRRecordsQueryDocument(ehrTypes),
        {
          patientId: activeSubjectId,
        },
        accountHeaders,
      ),
    [graphQLClient, activeSubjectId, ehrTypes, accountHeaders],
  );

  const { data: syncStatus } = useQuery(
    ['backfill-sync-status', ...ehrTypes],
    queryEHRSyncStatus,
    {
      enabled:
        !!activeSubjectId &&
        isFetched &&
        ehrTypes.length > 0 &&
        isBackfillEnabled,
      select(data) {
        return Object.fromEntries(
          Object.entries(data).map(([type, patientData]) => {
            return [
              type,
              patientData !== null &&
                !patientData.observationsConnection?.edges?.length &&
                !patientData.proceduresConnection?.edges?.length,
            ];
          }),
        ) as Record<DeviceSourceType, boolean>;
      },
    },
  );

  useEffect(() => {
    if (!wearablesState?.items?.length || !syncStatus) {
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
  }, [wearablesState?.items, syncStatus]);

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
        project: activeProject,
        end: new Date(end).toISOString(),
        start: start.toISOString(),
      });

      return !!createBackfillResponse.data.ingestionId;
    },
    [httpClient, activeProject, wearablesState?.items, isBackfillEnabled],
  );

  return { enabledBackfillWearables, backfillEHR };
};

const buildEHRRecordsQueryDocument = (types: EHRType[]) => gql`
  query GetEHRRecords($patientId: String) {
    ${types.map((type) => {
      if (!(type in deviceSourceTypes)) {
        return '';
      }

      const ehrType = type as any as DeviceSourceType;

      return `
      ${type}: patient(id: $patientId) {
        observationsConnection(tag: "${deviceSourceTypes[ehrType]}", first: 1) {
          edges {
            node {
              id
            }
          }
        }
        proceduresConnection(tag: "${deviceSourceTypes[ehrType]}", first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
      `;
    })}
  }
`;

type Response = {
  [K in DeviceSourceType]: {
    observationsConnection: {
      edges: {
        node: {
          id: string;
        };
      }[];
    };
    proceduresConnection: {
      edges: {
        node: {
          id: string;
        };
      }[];
    };
  };
};
