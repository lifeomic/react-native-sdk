import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { renderHook } from '@testing-library/react-native';
import { useAppConfig } from './useAppConfig';
import {
  AppTileMessageType,
  useHandleAppTileEvents,
} from './useHandleAppTileEvents';
import { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

jest.mock('./useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
}));

const useNavigationMock = useNavigation as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;
const openURLMock = Linking.openURL as jest.Mock;

const popMock = jest.fn();
const canGoBack = jest.fn();
const pushMock = jest.fn();

const surveysAppTile = { id: 'surveys', url: 'surveys.com' };

beforeEach(() => {
  canGoBack.mockReturnValue(true);

  useNavigationMock.mockReturnValue({
    canGoBack: canGoBack,
    push: pushMock,
    pop: popMock,
  });

  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        todayTileSettings: {
          surveysTile: surveysAppTile,
        },
      },
    },
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
});
