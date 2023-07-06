import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useMe } from './useMe';
import { useHttpClient } from './useHttpClient';

export interface Project {
  id: string;
  name: string;
}

interface ProjectsResponse {
  items: Project[];
}

export function useSubjectProjects() {
  const { account, accountHeaders } = useActiveAccount();
  const { data: subjects } = useMe();
  const { httpClient } = useHttpClient();

  return useQuery(
    [`${account?.id}-projects`, subjects],
    () =>
      httpClient
        .get<ProjectsResponse>(
          `/v1/projects?id=${subjects?.map((s) => s.projectId).join(',')}`,
          { headers: accountHeaders },
        )
        .then((res) => res.data.items),
    {
      enabled: !!accountHeaders,
    },
  );
}
