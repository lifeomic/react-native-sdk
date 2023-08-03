import { useActiveAccount } from './useActiveAccount';
import { useAuthenticatedQuery } from './useAuth';

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

  return useAuthenticatedQuery(
    'fhir/dstu3/$me',
    (client) =>
      client
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
