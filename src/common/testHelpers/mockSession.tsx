import { Account, AppConfig, Project, Subject, User } from '../../types';
// import { useSession } from '../../hooks/useSession';
import { useActiveAccount } from '../../hooks/useActiveAccount';
import { useActiveConfig } from '../../hooks/useActiveConfig';

let mockUseSessionFn = jest.fn();
jest.mock('../../hooks/useSession', () => ({
  useSession: mockUseSessionFn,
}));

jest.mock('../../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

jest.mock('../../hooks/useActiveConfig', () => ({
  useActiveConfig: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useActiveConfigMock = useActiveConfig as jest.Mock;

export const mockAccount: Account = {
  id: 'mockAccount',
  name: 'Mock Research Account',
  description: 'Unit testing is great!',
  type: '',
  logo: '',
  products: ['LR'],
  features: [],
  trialActive: false,
  trialEndDate: '',
};

export const mockUser: User = {
  id: 'mockUser123',
  profile: {
    email: 'mock_user_123@lifeomic.com',
    displayName: 'Unit Tester',
    givenName: 'Unity',
    familyName: 'Tester',
    picture: '',
  },
};

export const mockSubject: Subject = {
  subjectId: 'subjectId',
  projectId: 'projectId',
  name: [{}],
};

export const mockProject: Project = {
  id: 'projectId',
  name: 'Unit Testing Project',
};

export const mockAppConfig: AppConfig = {
  supportLink: 'http://unit-test/support',
  homeTab: {
    tiles: ['trackTile', 'todayTile'],
    trackTileSettings: {
      title: 'TrackTile Title',
      advancedScreenTrackers: [],
    },
    appTiles: [
      {
        id: 'tile-id-1',
        title: 'My First Tile',
        source: { url: 'https://tile.com' },
      },
      {
        id: 'tile-id-2',
        title: 'My Second Tile',
        source: { url: 'https://tile.com' },
      },
    ],
    todayTile: {
      id: 'today-tile',
      title: 'Today',
      source: { url: 'https://today-tile.com' },
    },
    circleTiles: [
      {
        circleName: 'Some Circle',
        circleId: 'Some CircleId',
        isMember: true,
        buttonText: 'Some Text',
      },
    ],
    myDataSettings: {
      components: [
        {
          title: 'Chart1',
          type: 'LineChart',
          trace1: {
            coding: [],
            label: 'Label1',
            type: 'Observation',
          },
        },
        {
          title: 'Chart2',
          type: 'LineChart',
          trace1: {
            coding: [],
            label: 'Label1',
            type: 'Observation',
          },
        },
      ],
    },
  },
  onboardingCourse: { url: 'http://example.com', title: 'Example Title' },
};

const getMockSession = (
  mockSession: MockSession = {
    accounts: [mockAccount],
    user: mockUser,
    subject: mockSubject,
    appConfig: mockAppConfig,
    project: mockProject,
  },
) => {
  return {
    userConfiguration: {
      configurations: [
        {
          account: mockSession.accounts?.[0]?.id,
          subjectConfigs: [
            {
              subject: mockSession.subject,
              project: mockSession.project,
              appConfig: mockSession.appConfig,
            },
          ],
        },
      ],
      sessionTime: new Date().toISOString(),
      accounts: mockSession.accounts,
      user: mockSession.user,
    },
    isLoaded: true,
    clearSession: jest.fn(),
  };
};

type MockSession = {
  user?: User;
  accounts?: Partial<Account>[];
  subject?: Subject;
  project?: Project;
  appConfig?: AppConfig;
};

export const mockUseSession = (sessionMock?: MockSession) => {
  mockUseSessionFn.mockReturnValue(getMockSession(sessionMock));
};

export const mockActiveAccount = (
  setNoAccounts: boolean = false,
  setActiveAccountIdMock = jest.fn(),
) => {
  useActiveAccountMock.mockReturnValue({
    account: setNoAccounts ? undefined : mockAccount,
    accountHeaders: setNoAccounts
      ? undefined
      : {
          'LifeOmic-Account': mockAccount.id,
        },
    isLoading: false,
    setActiveAccountId: setActiveAccountIdMock,
  });
};

export const mockActiveConfig = (sessionMock?: MockSession) => {
  const subjectConfig =
    getMockSession(sessionMock).userConfiguration.configurations[0]
      .subjectConfigs[0];
  useActiveConfigMock.mockReturnValue({
    ...subjectConfig,
    isLoading: false,
  });
};
