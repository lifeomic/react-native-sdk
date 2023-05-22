import * as React from 'react';
import { useCallback } from 'react';
import {
  NativeWearableLifecycleHandler,
  WearableIntegration,
  WearableIntegrationStatus,
} from './WearableTypes';
import { sortBy } from 'lodash';

type Props = {
  children: React.ReactNode;
};

export const WearableLifecycleContext = React.createContext<{
  onPreToggle: (
    wearable: WearableIntegration,
    enabled: boolean,
  ) => Promise<void>;
  onPostToggle: (wearable: WearableIntegration) => Promise<void>;
  sanitizeEHRs: (
    ehrs: WearableIntegration[],
    legacySort?: boolean,
  ) => Promise<WearableIntegration[]>;
  renderWearableControls: (wearable: WearableIntegration) => React.ReactNode;
}>({
  onPreToggle: async () => {},
  onPostToggle: async () => {},
  sanitizeEHRs: async (ehrs) => ehrs,
  renderWearableControls: () => null,
});

const handlers: NativeWearableLifecycleHandler[] = [];
const providers: React.ComponentType<{ children: React.ReactNode }>[] = [];

export const registerWearableLifecycleHandlers = handlers.push.bind(handlers);
export const registerWearableLifecycleProvider =
  providers.unshift.bind(providers);
export const deregisterWearableLifecycleHandlers = (
  ...handlersToRemove: NativeWearableLifecycleHandler[]
) => {
  handlersToRemove.forEach((handler) => {
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  });
};
export const WearableLifecycleProvider = ({ children }: Props) => {
  const onPreToggle = useCallback(
    async (wearable: WearableIntegration, enabled: boolean) => {
      await Promise.all(
        handlers.map((strategy) => strategy.preToggle?.(wearable, enabled)),
      );
    },
    [],
  );

  const onPostToggle = useCallback(async (wearable: WearableIntegration) => {
    await Promise.all(
      handlers.map((strategy) => strategy.postToggle?.(wearable)),
    );
  }, []);

  const sanitizeEHRs = useCallback(
    async (ehrs: WearableIntegration[], legacySort = false) => {
      let sanitizedEhrs = await handlers.reduce(
        async (awaitableEhrs, strategy) => {
          const currentEhrs = await awaitableEhrs;

          return strategy.sanitizeEHRs?.(await awaitableEhrs) ?? currentEhrs;
        },
        Promise.resolve(ehrs),
      );

      if (legacySort) {
        return sortBy(sanitizedEhrs, (item) => {
          const needsAttentionFlag =
            item.status === WearableIntegrationStatus.NeedsAuthorization ||
            item.syncTypes?.length === 0
              ? '0'
              : '1';
          const enabledFlag = item.enabled ? '0' : '1';
          const name = item.name;

          // NOTE: Sort by attention needed, enabled, then name (alphabetically):
          return `${needsAttentionFlag}${enabledFlag}${name}`;
        });
      }

      return sortBy(sanitizedEhrs, (item) => item.name?.toLocaleLowerCase());
    },
    [],
  );

  const renderWearableControls = useCallback(
    (wearable: WearableIntegration) => (
      <>
        {handlers.map(
          (handler) => handler.renderWearableControl?.(wearable) ?? null,
        )}
      </>
    ),
    [],
  );

  return providers.reduce(
    (agg, Provider, index) => (
      <Provider key={`wearable-provider-${index}`}>{agg}</Provider>
    ),
    <WearableLifecycleContext.Provider
      value={{
        onPostToggle,
        onPreToggle,
        sanitizeEHRs,
        renderWearableControls,
      }}
    >
      {children}
    </WearableLifecycleContext.Provider>,
  );
};

export const useWearableLifecycleHooks = () =>
  React.useContext(WearableLifecycleContext);
