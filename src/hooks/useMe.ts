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

export function useMe() {
  const { accountHeaders } = useActiveAccount();
  const { apiClient } = useHttpClient();
  const { lastAcceptedId } = usePendingInvite();

  const useMeQuery = useQuery(
    ['fhir/dstu3/$me', lastAcceptedId],
    () =>
      apiClient
        .request('GET /v1/fhir/dstu3/$me', {}, { headers: accountHeaders })
        .then((res) =>
          (res.data.entry ?? []).map((entry) => {
            const subject: Subject = {
              subjectId: entry.resource!.id,
              projectId: entry.resource!.meta!.tag!.find(
                (t) => t.system === 'http://lifeomic.com/fhir/dataset',
              )!.code!,
              name: entry.resource!.name,
              subject: entry.resource!,
            };
            return subject;
          }),
        ),
    {
      enabled: !!accountHeaders,
    },
  );

  return useMeQuery;
}
