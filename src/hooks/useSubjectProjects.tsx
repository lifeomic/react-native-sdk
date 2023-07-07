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

  return useQuery<Project[]>(
    [`${account?.id}-projects`, subjects],
    async () => {
      if (subjects?.length) {
        const res = await httpClient.get<ProjectsResponse>(
          `/v1/projects?id=${subjects?.map((s) => s.projectId).join(',')}`,
          { headers: accountHeaders },
        );
        return res.data.items;
      } else {
        // Having no subjects is a supported state.
        // Instead of disabling the query to wait for subjects we are
        // returning a mock response to keep downstream queries moving
        return [];
      }
    },
    {
      enabled: !!accountHeaders,
    },
  );
}
