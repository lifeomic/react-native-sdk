import { renderHook } from '@testing-library/react-native';
import {
  WearableLifecycleProvider,
  useWearableLifecycleHooks,
  registerWearableLifecycleHook,
  registerWearableLifecycleHandlers,
  deregisterWearableLifecycleHandlers,
} from './WearableLifecycleProvider';
import {
  EHRType,
  NativeWearableLifecycleHandler,
  WearableIntegrationStatus,
  WearableStateSyncType,
} from './WearableTypes';
import * as React from 'react';

const cleanUpActions: Function[] = [];
const fitbit = {
  ehrId: EHRType.Fitbit,
  ehrType: EHRType.Fitbit,
  name: 'Fitbit',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout,
  ],
  syncTypes: [
    WearableStateSyncType.Workout,
    WearableStateSyncType.SleepAnalysis,
  ],
};
const readoutHealth = {
  ehrId: EHRType.ReadoutHealth,
  ehrType: EHRType.ReadoutHealth,
  name: 'Biosense',
  enabled: false,
  supportedSyncTypes: [WearableStateSyncType.BreathKetones],
  syncTypes: [WearableStateSyncType.BreathKetones],
};
const ketoMojo = {
  ehrId: EHRType.KetoMojo,
  ehrType: EHRType.KetoMojo,
  name: 'Keto-Mojo',
  enabled: true,
  supportedSyncTypes: [
    WearableStateSyncType.BloodGlucose,
    WearableStateSyncType.BloodKetones,
  ],
  syncTypes: [WearableStateSyncType.BloodKetones],
};
const garmin = {
  ehrId: EHRType.Garmin,
  ehrType: EHRType.Garmin,
  name: 'Garmin',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout,
  ],
  syncTypes: [WearableStateSyncType.SleepAnalysis],
};
const googleFit = {
  ehrId: EHRType.GoogleFit,
  ehrType: EHRType.GoogleFit,
  name: 'GoogleFit',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout,
  ],
  syncTypes: [WearableStateSyncType.SleepAnalysis],
};

const getEnabledWearable = (baseProps: any) => {
  return {
    ...baseProps,
    enabled: true,
    status: WearableIntegrationStatus.Syncing,
  };
};

const renderHookInContext = (...handlers: NativeWearableLifecycleHandler[]) => {
  handlers.forEach((handler) => {
    registerWearableLifecycleHandlers(handler);
    cleanUpActions.push(() => deregisterWearableLifecycleHandlers(handler));
  });

  return renderHook(() => useWearableLifecycleHooks(), {
    wrapper: ({ children }) => (
      <WearableLifecycleProvider>{children}</WearableLifecycleProvider>
    ),
  });
};

describe('WearableLifecycleProvider', () => {
  afterEach(() => {
    cleanUpActions.forEach((action) => action());
    cleanUpActions.splice(0, cleanUpActions.length);
  });

  it("should call the handler's preToggle method when calling onPreToggle", async () => {
    const handler: NativeWearableLifecycleHandler = {
      preToggle: jest.fn(),
    };

    const { result } = renderHookInContext(handler);

    await result.current.onPreToggle(garmin, true);

    expect(handler.preToggle).toHaveBeenCalledTimes(1);
    expect(handler.preToggle).toHaveBeenCalledWith(garmin, true);
  });

  it("should call the handler's postToggle method when calling onPostToggle", async () => {
    const handler: NativeWearableLifecycleHandler = {
      postToggle: jest.fn(),
    };

    const { result } = renderHookInContext(handler);

    await result.current.onPostToggle(fitbit);

    expect(handler.postToggle).toHaveBeenCalledTimes(1);
    expect(handler.postToggle).toHaveBeenCalledWith(fitbit);
  });

  describe('sanitizeWearables', () => {
    it("should call the handler's sanitizeEHRs method when calling sanitizeEHRs", async () => {
      const handler: NativeWearableLifecycleHandler = {
        sanitizeEHRs: jest.fn(async (ehrs) => ehrs),
      };
      const noopHandler: NativeWearableLifecycleHandler = {};

      const { result } = renderHookInContext(handler, noopHandler);

      await result.current.sanitizeEHRs([fitbit]);

      expect(handler.sanitizeEHRs).toHaveBeenCalledTimes(1);
      expect(handler.sanitizeEHRs).toHaveBeenCalledWith([fitbit]);
    });

    it('always shows readoutHealth', async () => {
      const { result: hook } = renderHookInContext();

      const result = await hook.current.sanitizeEHRs([
        getEnabledWearable(fitbit),
        readoutHealth,
      ]);

      expect(result).toEqual([readoutHealth, getEnabledWearable(fitbit)]);
    });

    it('always shows ketoMojo', async () => {
      const { result: hook } = renderHookInContext();

      const result = await hook.current.sanitizeEHRs([
        getEnabledWearable(fitbit),
        ketoMojo,
      ]);

      expect(result).toEqual([getEnabledWearable(fitbit), ketoMojo]);
    });

    it('shows other wearables when only readoutHealth is enabled', async () => {
      const { result: hook } = renderHookInContext();

      const result = await hook.current.sanitizeEHRs([
        getEnabledWearable(readoutHealth),
        fitbit,
      ]);

      expect(result).toEqual([getEnabledWearable(readoutHealth), fitbit]);
    });

    it('shows other wearables when only ketoMojo is enabled', async () => {
      const { result: hook } = renderHookInContext();

      const result = await hook.current.sanitizeEHRs([
        getEnabledWearable(ketoMojo),
        fitbit,
      ]);

      expect(result).toEqual([fitbit, getEnabledWearable(ketoMojo)]);
    });

    it('if legacySort=true, sorts wearables by attention-needed, enabled, then alphabetical', async () => {
      const enabledKetoMojo = getEnabledWearable(ketoMojo);
      const fitbitNeedsAuth = {
        ...fitbit,
        status: WearableIntegrationStatus.NeedsAuthorization,
      };
      const readoutWithNoSyncTypes = {
        ...readoutHealth,
        syncTypes: [],
      };

      const { result: hook } = renderHookInContext();

      const result = await hook.current.sanitizeEHRs(
        [garmin, enabledKetoMojo, fitbitNeedsAuth, readoutWithNoSyncTypes],
        true, // enableMultiWearable
        true, // legacySort param
      );

      expect(result).toEqual([
        // Needs attention brought to the top:
        readoutWithNoSyncTypes,
        fitbitNeedsAuth,

        // Next comes enabled wearables:
        enabledKetoMojo,

        // Then sort alphabetical:
        garmin,
      ]);
    });

    it('without legacySort, sorts wearables only by name', async () => {
      const enabledKetoMojo = getEnabledWearable(ketoMojo);
      const fitbitNeedsAuth = {
        ...fitbit,
        status: WearableIntegrationStatus.NeedsAuthorization,
      };
      const readoutWithNoSyncTypes = {
        ...readoutHealth,
        syncTypes: [],
      };
      const { result: hook } = renderHookInContext();

      const result = await hook.current.sanitizeEHRs(
        [garmin, enabledKetoMojo, fitbitNeedsAuth, readoutWithNoSyncTypes],
        true, // enableMultiWearable
        // missing legacySort param
      );

      expect(result).toEqual([
        // All alphabetical, regardless of enabled & issue:
        readoutWithNoSyncTypes, // "Biosense"
        fitbitNeedsAuth,
        garmin,
        enabledKetoMojo,
      ]);
    });

    it('with enableMultiWearable=false shows only enabled wearables and ketoMojo and readOut', async () => {
      const { result: hook } = renderHookInContext();
      const enabledEHRs = [fitbit, garmin].map(getEnabledWearable);
      const otherEHRs = [googleFit];

      const result = await hook.current.sanitizeEHRs(
        [...enabledEHRs, readoutHealth, ketoMojo, ...otherEHRs],
        false, // enableMultiWearable
        // missing legacySort param
      );

      expect(result).toEqual([
        readoutHealth, // "Biosense"
        ...enabledEHRs,
        ketoMojo,
      ]);
    });
  });

  it('should allow registering a custom lifecycle hook', () => {
    const customHook = jest.fn();
    registerWearableLifecycleHook(customHook);

    renderHookInContext();

    expect(customHook).toHaveBeenCalled();
  });

  it('should throw an error if registering a new hook between renders', () => {
    registerWearableLifecycleHook(jest.fn());

    const { rerender } = renderHookInContext();

    registerWearableLifecycleHook(jest.fn()); // should cause an error on next render

    expect(() => rerender({})).toThrowError(
      "[WearableLifecycleProvider]: Lifecycle hooks changed between renders. Call 'registerWearableLifecycleHook' as early as possible to prevent this error.",
    );
  });
});
