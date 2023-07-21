import { useNavigation } from '@react-navigation/native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { useTrackers } from '../components/TrackTile/hooks/useTrackers';
import {
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
  Tracker,
} from '../components/TrackTile/services/TrackTileService';
import { useAppConfig } from './useAppConfig';
import {
  AppTileMessageType,
  useHandleAppTileEvents,
} from './useHandleAppTileEvents';

jest.mock('./useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

jest.mock('../components/TrackTile/hooks/useTrackers', () => ({
  useTrackers: jest.fn(),
}));

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
}));

const useNavigationMock = useNavigation as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;
const useTrackersMock: jest.Mock<ReturnType<typeof useTrackers>> =
  useTrackers as jest.Mock;
const openURLMock = Linking.openURL as jest.Mock;

const popMock = jest.fn();
const canGoBack = jest.fn();
const pushMock = jest.fn();
const addListenerMock = jest.fn();
const removeListenerMock = jest.fn();

const surveysAppTile = { id: 'surveys', url: 'surveys.com' };

const pillarTracker = {
  metricId: 'test-tile-metric-id',
} as Tracker;

beforeEach(() => {
  canGoBack.mockReturnValue(true);

  useNavigationMock.mockReturnValue({
    canGoBack: canGoBack,
    push: pushMock,
    pop: popMock,
    addListener: addListenerMock,
    removeListener: removeListenerMock,
  });

  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        todayTileSettings: {
          surveysTile: surveysAppTile,
        },
        tiles: ['pillarsTile'],
      },
    },
  });

  useTrackersMock.mockReturnValue({
    pillarTrackers: [pillarTracker],
    trackers: [],
    error: false,
    loading: false,
  });
});

describe('handleAppTileMessage', () => {
  it('should handle deep link message and call openSurveyAppTile', () => {
    const questionnaire = '123';
    const appTileMessage = {
      type: AppTileMessageType.deepLink,
      data: {
        routeName: 'tiles/Today/Survey',
        params: { questionnaire },
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'Surveys',
        url: 'surveys.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(pushMock).toBeCalledWith('Home/AuthedAppTile', {
      appTile: surveysAppTile,
      searchParams: { responseId: questionnaire },
    });
  });

  it('should handle deep link message and call openCircleDiscussionScreen', () => {
    const circleId = 'CIRCLE_ID';
    const circleName = 'CIRCLE_NAME';
    const appTileMessage = {
      type: AppTileMessageType.deepLink,
      data: {
        routeName: 'social/PostDetails',
        params: { circleId, circleName },
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'Circles',
        url: 'circles.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(pushMock).toBeCalledWith('Home/Circle/Discussion', {
      circleTile: {
        circleId,
        circleName,
        buttonText: circleName,
        isMember: true,
      },
    });
  });

  it('should handle deep link message and call openPillarTracker', () => {
    const metricId = 'test-tile-metric-id';
    const referenceDate = new Date();
    const appTileMessage = {
      type: AppTileMessageType.deepLink,
      data: {
        routeName: 'tiles/TrackTile',
        params: { metricId, referenceDate },
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'Track FooBar',
        url: 'foobar.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(pushMock).toBeCalledWith('Home/TrackTile', {
      tracker: pillarTracker,
      referenceDate,
      valuesContext: {
        system: TRACKER_PILLAR_CODE_SYSTEM,
        codeBelow: TRACKER_PILLAR_CODE,
      },
    });
  });

  it('should no-op if the tracker cannot be found', () => {
    const metricId = 'random-id';
    const appTileMessage = {
      type: AppTileMessageType.deepLink,
      data: {
        routeName: 'tiles/TrackTile',
        params: { metricId },
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'Track FooBar',
        url: 'foobar.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(pushMock).not.toBeCalled();
  });

  it('should no-op if the routeName is not supported', () => {
    const appTileMessage = {
      type: AppTileMessageType.deepLink,
      data: {
        routeName: 'randomRoute',
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'Randome route',
        url: 'random-route.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('should call handleOpenUrlMessage and opens the url', () => {
    const url = 'https://www.google.com ';
    const appTileMessage = {
      type: AppTileMessageType.openUrl,
      data: {
        url,
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'event',
        url: 'event.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(openURLMock).toBeCalledWith(url);
  });

  it('should append https to the URL', () => {
    const url = 'www.google.com ';
    const appTileMessage = {
      type: AppTileMessageType.openUrl,
      data: {
        url,
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'event',
        url: 'event.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(openURLMock).toBeCalledWith(`https://${url}`);
  });

  it('should not append https if http is included', () => {
    const url = 'http://www.google.com ';
    const appTileMessage = {
      type: AppTileMessageType.openUrl,
      data: {
        url,
      },
    };
    const { result } = renderHook(() => useHandleAppTileEvents());
    const event = {
      nativeEvent: {
        data: JSON.stringify(appTileMessage),
        canGoBack: true,
        canGoForward: false,
        loading: false,
        title: 'event',
        url: 'event.com',
        lockIdentifier: 1234442,
      },
    };
    result.current.handleAppTileMessage(event as WebViewMessageEvent);
    expect(openURLMock).toBeCalledWith(url);
  });
});

describe('handleAppTileNavigationStateChange', () => {
  it('should pop the current route from the navigation stack', () => {
    const event = { url: 'www.hello.world/pending-lx-action' };
    const { result } = renderHook(() => useHandleAppTileEvents());
    result.current.handleAppTileNavigationStateChange(
      event as WebViewNavigation,
    );
    expect(popMock).toBeCalled();
  });

  it('should not pop current route from the navigation stack if cannot go back', () => {
    canGoBack.mockReturnValue(false);
    const event = { url: 'www.hello.world/pending-lx-action' };
    const { result } = renderHook(() => useHandleAppTileEvents());
    result.current.handleAppTileNavigationStateChange(
      event as WebViewNavigation,
    );
    expect(popMock).not.toBeCalled();
  });

  it('should no-op if the url does not contain pending-lx-action', () => {
    canGoBack.mockReturnValue(false);
    const event = { url: 'www.hello.world' };
    const { result } = renderHook(() => useHandleAppTileEvents());
    result.current.handleAppTileNavigationStateChange(
      event as WebViewNavigation,
    );
    expect(popMock).not.toBeCalled();
  });

  it('should prevent navigation goBack and use webView goBack when possible', async () => {
    const event = { url: 'www.hello.world', canGoBack: true };
    const webView: any = { goBack: jest.fn() };
    const preventDefault = jest.fn();
    const { result } = renderHook(() => useHandleAppTileEvents(webView));

    result.current.handleAppTileNavigationStateChange(
      event as WebViewNavigation,
    );

    await waitFor(() => expect(addListenerMock.mock.calls).toHaveLength(2)); // Initial & Event Triggered Rerender

    const handler = addListenerMock.mock.lastCall?.[1];

    expect(handler).toBeDefined();

    act(() => {
      handler({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(webView.goBack).toHaveBeenCalled();
  });

  it('should not block navigation back if webapp canGoBack is false', () => {
    const event = { url: 'www.hello.world', canGoBack: false };
    const webView: any = { goBack: jest.fn() };
    const preventDefault = jest.fn();
    const { result } = renderHook(() => useHandleAppTileEvents(webView));

    result.current.handleAppTileNavigationStateChange(
      event as WebViewNavigation,
    );

    const handler = addListenerMock.mock.lastCall?.[1];

    expect(handler).toBeDefined();

    act(() => {
      handler({ preventDefault });
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(webView.goBack).not.toHaveBeenCalled();
  });

  it('should not block navigation back if webapp canGoBack is true and webview is null', () => {
    const event = { url: 'www.hello.world', canGoBack: true };
    const preventDefault = jest.fn();
    const { result } = renderHook(() => useHandleAppTileEvents(null));

    result.current.handleAppTileNavigationStateChange(
      event as WebViewNavigation,
    );

    const handler = addListenerMock.mock.lastCall?.[1];

    expect(handler).toBeDefined();

    act(() => {
      handler({ preventDefault });
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
