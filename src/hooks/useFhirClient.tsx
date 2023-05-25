import { useQuery, useMutation } from 'react-query';
import { Bundle, Observation, Coding } from 'fhir/r3';
import formatISO from 'date-fns/formatISO';
import { useHttpClient } from './useHttpClient';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import merge from 'deepmerge';
import { useState, useEffect, useCallback } from 'react';
import queryString from 'query-string';

type ResourceTypes = {
  Observation: Observation;
};
type ResourceType = Observation;

type QueryParams = {
  resourceType: keyof ResourceTypes;
  pageSize?: number;
  coding?: Coding[];
};

type DeleteParams = {
  id: string;
  resourceType: keyof ResourceTypes;
};

export function useFhirClient() {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  const { activeProject, activeSubjectId } = useActiveProject();

  const useSearchResourcesQuery = (queryParams: QueryParams) => {
    const [next, setNext] = useState(0);
    const [nextFromData, setNextFromData] = useState<number | undefined>();
    const [responseData, setResponseData] = useState<Bundle<Observation>>();
    const [hasMoreData, setHasMoreData] = useState(false);

    const toFhirCodeFilter = () => {
      if (queryParams.coding) {
        return queryParams.coding
          .map(({ system, code }) => `${system}|${code}`)
          .join(',');
      }
    };

    const params = merge(
      {
        // Defaults:
        _tag: `http://lifeomic.com/fhir/dataset|${activeProject?.id}`,
        patient: activeSubjectId,
        next: next.toString(),
        code: toFhirCodeFilter(),
      },
      {
        resourceType: queryParams.resourceType,
        pageSize: queryParams.pageSize,
      },
    );
    const resourceType = queryParams.resourceType;

    // TODO: add code, date, & other query param capabilities
    // TODO: consider using fhir-search across the board (documenting delay)

    const fetchNext = useCallback(
      (next: number) => {
        if (hasMoreData) {
          setNext(next);
        }
      },
      [hasMoreData],
    );

    const queryResult = useQuery(
      [`${resourceType}/_search`, params],
      () => {
        return httpClient
          .post<Bundle<ResourceTypes[typeof resourceType]>>(
            `/v1/fhir/dstu3/${resourceType}/_search`,
            params,
            {
              headers: accountHeaders,
            },
          )
          .then((res) => {
            const { data } = res;
            setResponseData(data);
            return data;
          });
      },
      {
        enabled: !!accountHeaders && !!activeProject?.id && !!activeSubjectId,
        keepPreviousData: true,
      },
    );

    useEffect(() => {
      const nextLink = responseData?.link?.find((_) => _.relation === 'next');
      const nextStr = nextLink?.url
        ? queryString.parse(nextLink.url).next?.toString()
        : undefined;
      const nextInt = nextStr ? parseInt(nextStr, 10) : undefined;
      setHasMoreData(!!nextLink);
      setNextFromData(nextInt);
    }, [responseData]);

    return {
      ...queryResult,
      next: nextFromData,
      fetchNext,
      hasMoreData,
    };
  };

  const useCreateResourceMutation = () => {
    return useMutation({
      mutationFn: async (resourceToUpsert: ResourceType) => {
        if (!accountHeaders || !activeProject?.id || !activeSubjectId) {
          throw new Error('Cannot mutate resource in current state');
        }
        let resource = merge<ResourceType>({}, resourceToUpsert);

        // Subject
        resource.subject = {
          reference: `Patient/${activeSubjectId}`,
        };

        // Project/dataset
        if (
          !resource.meta?.tag?.find(
            (t) => t.system === 'http://lifeomic.com/fhir/dataset',
          )
        ) {
          resource = merge(resource, { meta: { tag: [] } });
          resource.meta!.tag!.push({
            system: 'http://lifeomic.com/fhir/dataset',
            code: activeProject?.id,
          });
        }

        // Date/time
        if (resource.resourceType === 'Observation') {
          const observation = resource as fhir3.Observation;
          if (!observation.effectiveDateTime) {
            observation.effectiveDateTime = formatISO(Date.now());
          }
        }

        return httpClient
          .post<ResourceType>(
            `/v1/fhir/dstu3/${resource.resourceType}`,
            resource,
            {
              headers: accountHeaders,
            },
          )
          .then((res) => res.data);
      },
    });
  };

  const useDeleteResourceMutation = () => {
    return useMutation({
      mutationFn: async (params: DeleteParams) => {
        if (!accountHeaders) {
          throw new Error('Cannot delete resource in current state');
        }

        return httpClient
          .delete(`/v1/fhir/dstu3/${params.resourceType}/${params.id}`, {
            headers: accountHeaders,
          })
          .then((res) => res.data);
      },
    });
  };

  return {
    useSearchResourcesQuery,
    useCreateResourceMutation,
    useDeleteResourceMutation,
  };
}
