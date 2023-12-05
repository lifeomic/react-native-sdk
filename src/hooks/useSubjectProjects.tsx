import { useQuery } from '@tanstack/react-query';
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
  const { account } = useActiveAccount();
  const { data: subjects } = useMe();
  const { httpClient } = useHttpClient();

  const projectIds = subjects?.map((s) => s.projectId) ?? [];

  return useQuery<Project[]>([`${account}-projects`, projectIds], async () => {
    // Having no subjects is a supported state.
    // Instead of disabling the query to wait for subjects we are
    // returning a mock response to keep downstream queries moving
    if (projectIds.length === 0) {
      return [];
    }
    const res = await httpClient.get<ProjectsResponse>(
      `/v1/projects?${projectIds.map((id) => `id=${id}`).join('&')}`,
    );
    return res.data.items;
  });
}
