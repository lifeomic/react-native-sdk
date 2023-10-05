import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { Patient } from 'fhir/r3';
import { usePendingInvite } from './usePendingInvite';

export interface Subject {
  subjectId: string;
  projectId: string;
  name: Patient['name'];
  subject: Patient;
}

interface Entry {
  resource: Patient;
}

interface MeResponse {
  resourceType: 'Bundle';
  entry: Entry[];
}

export function useMe() {
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();
  const { lastAcceptedId } = usePendingInvite();

  const useMeQuery = useQuery(
    ['fhir/dstu3/$me', lastAcceptedId],
    () =>
      httpClient
        .get<MeResponse>('/v1/fhir/dstu3/$me', { headers: accountHeaders })
        .then((res) =>
          res.data.entry?.map(
            (entry) =>
              ({
                subjectId: entry.resource.id,
                projectId: entry.resource.meta?.tag?.find(
                  (t) => t.system === 'http://lifeomic.com/fhir/dataset',
                )?.code,
                name: entry.resource.name,
                subject: entry.resource,
              } as Subject),
          ),
        ),
    {
      enabled: !!accountHeaders,
    },
  );

  return useMeQuery;
}
