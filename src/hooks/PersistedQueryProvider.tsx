import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { isArray } from 'lodash';
import React from 'react';
import {
  Query,
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/query-core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const queriesToPersist = ['profile'];

const filterQueryByKey = (q: any) => {
  // PersistClientCore imports a legacy version of type Query
  const query = q as Query;
  if (isArray(query.queryKey)) {
    // Match on first part of key only to ignore unique ids
    const keyPart = query.queryKey?.[0];
    if (queriesToPersist.includes(keyPart)) {
      return defaultShouldDehydrateQuery(q);
    }
  }

  return false;
};

// For now persist no mutations to storage
const filterAllMutations = () => false;

type Props = {
  children: React.ReactNode;
};

export const PersistedQueryProvider = ({ children }: Props) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        dehydrateOptions: {
          shouldDehydrateQuery: filterQueryByKey,
          shouldDehydrateMutation: filterAllMutations,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
