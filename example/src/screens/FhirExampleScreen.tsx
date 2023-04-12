import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useFhirClient } from 'src';

export function FhirExampleScreen() {
  const {
    useSearchResourcesQuery,
    useCreateResourceMutation,
    useDeleteResourceMutation,
  } = useFhirClient();

  const { data, error, isLoading, refetch } = useSearchResourcesQuery({
    resourceType: 'Observation',
  });
  const firstSearchResultId = data?.entry?.[0]?.resource?.id;
  const observation: fhir3.Observation = useMemo(
    () => ({
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '29463-7',
            display: 'Body weight',
          },
        ],
      },
      valueQuantity: {
        code: 'kg',
        system: 'http://unitsofmeasure.org',
        value: 73.5,
      },
    }),
    [],
  );
  const upsertMutation = useCreateResourceMutation();
  const deleteMutation = useDeleteResourceMutation();

  const saveObservation = useCallback(async () => {
    const savedObservation = await upsertMutation?.mutateAsync(observation);
    console.warn('save result', savedObservation);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    refetch();
  }, [observation, upsertMutation, refetch]);

  const deleteObservation = useCallback(async () => {
    const observationId = firstSearchResultId;
    if (!observationId) {
      return;
    }
    await deleteMutation?.mutateAsync({
      id: observationId,
      resourceType: 'Observation',
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    refetch();
  }, [firstSearchResultId, deleteMutation, refetch]);

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    console.warn('observationsQuery.error', error);
    return <Text>Error occurred</Text>;
  }

  return (
    <ScrollView>
      <Text>What do we have? {JSON.stringify(data || {}, null, 2)}</Text>
      <Button onPress={saveObservation}>
        <Text>Save observation</Text>
      </Button>
      <Button onPress={deleteObservation}>
        <Text>Delete observation</Text>
      </Button>
    </ScrollView>
  );
}
