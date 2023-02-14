import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';

export interface Me {
  patientId: string;
}

interface MeResponse {
  resourceType: 'Bundle';
  entry: [
    {
      resource: {
        id: string;
      };
    },
  ];
}

export function useMe() {
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();

  return useQuery(
    'fhir/dstu3/$me',
    () =>
      httpClient
        .get<MeResponse>('/v1/fhir/dstu3/$me', { headers: accountHeaders })
        .then((res) => ({
          patientId: res.data.entry?.[0]?.resource?.id,
        })),
    {
      enabled: !!accountHeaders,
    },
  );
}
