import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';

export interface Subject {
  subjectId: string;
  projectId: string;
}

interface Entry {
  resource: {
    id: string;
    meta: {
      tag: [
        {
          system: string;
          code: string;
        },
      ];
    };
  };
}

interface MeResponse {
  resourceType: 'Bundle';
  entry: Entry[];
}

export function useMe() {
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();

  return useQuery(
    'fhir/dstu3/$me',
    () =>
      httpClient
        .get<MeResponse>('/v1/fhir/dstu3/$me', { headers: accountHeaders })
        .then((res) =>
          res.data.entry?.map(
            (entry) =>
              ({
                subjectId: entry.resource.id,
                projectId: entry.resource.meta.tag.find(
                  (t) => t.system === 'http://lifeomic.com/fhir/dataset',
                )?.code,
              } as Subject),
          ),
        ),
    {
      enabled: !!accountHeaders,
    },
  );
}
