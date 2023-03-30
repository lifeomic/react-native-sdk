export interface WearablesSyncModule {
  isHealthKitAllowed(): Promise<boolean>;
  isSamsungHealthAllowed(): Promise<boolean>;
  authorizeHealthKit(syncTypes: string[]): any;
  requestPermissions(ehrType: string, permissions: string[]): Promise<any>;
}
