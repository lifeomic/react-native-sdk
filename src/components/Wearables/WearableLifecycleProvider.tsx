import * as React from 'react';
import { useCallback } from 'react';
import {
  NativeWearableLifecycleHandler,
  WearableIntegration,
  WearableIntegrationStatus,
  EHRType,
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
    enableMultiWearable?: boolean,
    legacySort?: boolean,
  ) => Promise<WearableIntegration[]>;
}>({
  onPreToggle: async () => {},
  onPostToggle: async () => {},
  sanitizeEHRs: async (ehrs) => ehrs,
});

const handlers: NativeWearableLifecycleHandler[] = [];
const hooks: Function[] = [];

export const registerWearableLifecycleHandlers = handlers.push.bind(handlers);
export const registerWearableLifecycleHook = hooks.push.bind(hooks);
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
  if (__DEV__) {
    // eslint-disable-next-line
    const [initialHookLength] = React.useState(hooks.length);

    if (initialHookLength !== hooks.length) {
      throw new Error(
        "[WearableLifecycleProvider]: Lifecycle hooks changed between renders. Call 'registerWearableLifecycleHook' as early as possible to prevent this error.",
      );
    }
  }

  for (const useCustomWearableLifeCycleHook of hooks) {
    // eslint-disable-next-line
    useCustomWearableLifeCycleHook();
  }

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
    async (
      ehrs: WearableIntegration[],
      enableMultiWearable = true,
      legacySort = false,
    ) => {
      const readoutHealthEHR = ehrs.find(
        (i) => i.ehrType === EHRType.ReadoutHealth,
      );
      const ketoMojoEHR = ehrs.find((i) => i.ehrType === 'ketoMojo');

      let sanitizedEhrs = await handlers.reduce(
        async (awaitableEhrs, strategy) => {
          const currentEhrs = await awaitableEhrs;

          return strategy.sanitizeEHRs?.(await awaitableEhrs) ?? currentEhrs;
        },
        Promise.resolve(ehrs),
      );

      if (!enableMultiWearable) {
        // If any integrations are enabled, hide the others.
        const enabledItems = sanitizedEhrs.filter((wearable) => {
          return (
            wearable.ehrType !== EHRType.ReadoutHealth &&
            wearable.ehrType !== EHRType.KetoMojo &&
            wearable.enabled &&
            wearable.status === WearableIntegrationStatus.Syncing
          );
        });
        if (enabledItems.length) {
          sanitizedEhrs = enabledItems;
        }

        // Always display readoutHealth & ketoMojo, which are allowed to be on in addition to other integrations
        if (
          readoutHealthEHR &&
          !sanitizedEhrs.find((w) => w.ehrId === readoutHealthEHR.ehrId)
        ) {
          sanitizedEhrs.push(readoutHealthEHR);
        }
        if (
          ketoMojoEHR &&
          !sanitizedEhrs.find((w) => w.ehrId === ketoMojoEHR.ehrId)
        ) {
          sanitizedEhrs.push(ketoMojoEHR);
        }
      }

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

  return (
    <WearableLifecycleContext.Provider
      value={{ onPostToggle, onPreToggle, sanitizeEHRs }}
    >
      {children}
    </WearableLifecycleContext.Provider>
  );
};

export const useWearableLifecycleHooks = () =>
  React.useContext(WearableLifecycleContext);
