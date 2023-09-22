// This file is useful when you need to share the same type across several
// files and don't want to import any of the consuming source files.

import { Patient } from 'fhir/r3';
import { Trace } from './components/MyData/LineChart/TraceLine';

export interface ProjectInvite {
  id: string;
  account: string;
  accountName: string;
  email: string;
  status: string;
  expirationTimestamp: string;
  purpose?: string;
}

export interface User {
  id: string;
  profile: {
    email: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
  };
}

export interface Account {
  id: string;
  name: string;
  type: string;
  description: string;
  logo: string;
  products: string[];
  features: string[];
  trialActive: boolean;
  trialEndDate: string;
}

export interface Subject {
  subjectId: string;
  projectId: string;
  name: Patient['name'];
}

export interface Entry {
  resource: Patient;
}

export interface Project {
  id: string;
  name: string;
}

export type SubjectConfig = {
  subject?: Subject;
  project?: Project;
  appConfig?: AppConfig;
};

export interface AppTile {
  id: string;
  title: string;
  source: {
    url: string;
  };
  icon?: string;
  clientId?: string;
  scope?: string;
  callbackUrls?: string[];
}

export interface CircleTile {
  buttonText: string;
  circleName: string;
  circleId: string;
  isMember: boolean;
}

export interface MessageTile {
  id: string;
  providerUserIds: string;
  userIds: string[];
  role: string;
  displayName: string;
}

type Tile = 'todayTile' | 'trackTile' | 'pillarsTile' | 'myDataTile';

export interface AppConfig {
  homeTab?: {
    appTiles?: AppTile[];
    circleTiles?: CircleTile[];
    tiles?: Tile[];
    trackTileSettings?: {
      title: string;
      advancedScreenTrackers: string[];
      includePublic?: boolean;
    };
    messageTiles?: MessageTile[];
    pillarSettings?: { advancedScreenTrackers: string[] };
    myDataSettings?: {
      components: {
        type: 'LineChart';
        title: string;
        trace1: Trace;
        trace2?: Trace;
      }[];
    };
    todayTile?: AppTile;
    todayTileSettings?: {
      todayTile: AppTile;
      surveysTile: AppTile;
    };
    screenHeader?: {
      title?: string;
      enableRefresh?: boolean;
    };
  };
  onboardingCourse?: {
    url: string;
    title?: string;
  };
  supportLink?: string;
  brand?: Record<string, any>;
}
