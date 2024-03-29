export enum EHRType {
  Dexcom = 'dexcom',
  Fitbit = 'fitbit',
  Garmin = 'garmin',
  KetoMojo = 'ketoMojo',
  Oura = 'oura',
  ReadoutHealth = 'readoutHealth',
  GoogleFit = 'googleFit',
  HealthKit = 'healthKit',
}

export enum WearableStateSyncType {
  // Body measurements
  BodyMass = 'bodyMass',
  LeanBodyMass = 'leanBodyMass',
  BodyFatPercentage = 'bodyFatPercentage',
  WaistCircumference = 'waistCircumference',
  BodyMassIndex = 'bodyMassIndex',

  // Fitness
  ActiveEnergyBurned = 'activeEnergyBurned',
  BasalEnergyBurned = 'basalEnergyBurned',
  CaloriesBurned = 'caloriesBurned',
  StepCount = 'stepCount',
  DistanceWalkingRunning = 'distanceWalkingRunning',
  DistanceCycling = 'distanceCycling',
  MindfulSession = 'mindfulSession',
  Workout = 'workout',
  Vo2Max = 'vo2Max',

  // Vital signs
  BloodPressure = 'bloodPressure',
  HeartRate = 'heartRate',
  HeartRateVariability = 'heartRateVariability',
  RestingHeartRate = 'restingHeartRate',
  RespiratoryRate = 'respiratoryRate',

  // Result identifiers
  BloodGlucose = 'bloodGlucose',
  OxygenSaturation = 'oxygenSaturation',

  // Sleep
  SleepAnalysis = 'sleepAnalysis',

  // Ketones
  BreathKetones = 'breathKetones',
  BloodKetones = 'bloodKetones',

  //Clinical Records
  Immunization = 'immunization',
}
export interface WearableIntegration {
  ehrId: string;
  ehrType: string;
  name: string;
  enabled: boolean;
  status?: WearableIntegrationStatus;
  lastSync?: string;
  failureCode?: string;
  meta?: any;
  supportedSyncTypes?: Array<WearableStateSyncType>;
  syncTypes?: Array<WearableStateSyncType>;
}

export interface ToggleWearableResult extends WearableIntegration {
  authorizationUrl?: string;
}

export type SyncTypeSettings = Record<WearableStateSyncType, string>;

export enum WearableIntegrationStatus {
  NeedsAuthorization = 'NEEDS_AUTHORIZATION',
  Syncing = 'SYNCING',
  Failure = 'FAILURE',
}

export enum WearableIntegrationFailureCode {
  InvalidFHIR = 'INVALID_FHIR',
  APIRateLimit = 'API_RATE_LIMIT',
  Unknown = 'UNKNOWN',
}

export interface WearableIntegrationConfig {
  include?: string[];
  appId?: string;
  appVersionNumber?: string;
}

export interface WearablesSyncState {
  items: WearableIntegration[];
}

export interface NativeWearableLifecycleHandler {
  preToggle?(wearable: WearableIntegration, enabled: boolean): Promise<void>;
  postToggle?(wearable: WearableIntegration): Promise<void>;
  sanitizeEHRs?(ehrs: WearableIntegration[]): Promise<WearableIntegration[]>;
  onBackfill?(wearable: WearableIntegration): Promise<boolean>;
}
