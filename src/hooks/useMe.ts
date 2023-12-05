import { Patient } from 'fhir/r3';
import { useRestQuery } from './rest-api';

export interface Subject {
  subjectId: string;
  projectId: string;
  name: Patient['name'];
  subject: Patient;
}

export function useMe() {
  return useRestQuery(
    'GET /v1/fhir/dstu3/$me',
    {},
    {
      select: (data) => {
        const subjects: Subject[] = data.entry.map((entry) => ({
          subjectId: entry.resource.id,
          projectId: entry.resource.meta?.tag?.find(
            (t) => t.system === 'http://lifeomic.com/fhir/dataset',
          )?.code!,
          name: entry.resource.name,
          subject: entry.resource,
        }));

        return subjects;
      },
    },
  );
}
