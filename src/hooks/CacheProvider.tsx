import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext } from 'react';
import { Cache } from 'react-native-cache';

type CacheContextProps = {
  cache?: Cache;
};

export const CacheContext = createContext<CacheContextProps>({
  cache: undefined,
});

export const CacheContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <CacheContext.Provider
      value={{
        cache: new Cache({
          namespace: 'LO-SDK',
          policy: {
            maxEntries: 5000, // if unspecified, it can have unlimited entries
            stdTTL: 60 * 60 * 24, // the standard ttl as number in seconds, default: 0 (unlimited)
          },
          backend: AsyncStorage,
        }),
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const cacheContext = useContext(CacheContext);
  if (!cacheContext) {
    throw new Error('No CacheContext.Provider found when calling useCache');
  }
  return cacheContext;
};
