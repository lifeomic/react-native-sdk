import { Linking } from 'react-native';
import type {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import { CircleTile, useAppConfig } from './useAppConfig';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../navigators/types';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationParams = {
  [x: string]: unknown | undefined;
  referenceDate?: string | number | Date;
};

type DeepLinkRouteName = 'tiles/Today/Survey' | 'social/PostDetails';

export enum AppTileMessageType {
  deepLink = 'deepLink',
  openUrl = 'openUrl',
  openConsent = 'openConsent',
}

export type DeepLinkDataType = {
  routeName: DeepLinkRouteName;
  params: NavigationParams;
};

export type OpenUrlDataType = {
  url: string;
  title?: string;
  appendUtm?: boolean;
};

export type DeepLinkAppletMessage = {
  type: AppTileMessageType.deepLink;
  data: DeepLinkDataType;
};

export type OpenUrlAppletMessage = {
  type: AppTileMessageType.openUrl;
  data: OpenUrlDataType;
};

export type AppTileMessage = DeepLinkAppletMessage | OpenUrlAppletMessage;

export const useHandleAppTileEvents = () => {
  const { data } = useAppConfig();
  const todayTileSettings = data?.homeTab?.todayTileSettings;
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  const openSurveyAppTile = (responseId: string | undefined) => {
    if (!todayTileSettings?.surveysTile || !responseId) {
      return;
    }
    navigation.push('Home/AuthedAppTile', {
      appTile: todayTileSettings.surveysTile,
      searchParams: { responseId },
    });
  };

  const openCircleDiscussionScreen = (circleId: string, circleName: string) => {
    const circleTile: CircleTile = {
      circleId,
      circleName,
      buttonText: circleName,
      isMember: true,
    };
    navigation.push('Home/Circle/Discussion', { circleTile });
  };

  const handleDeepLinkMessage = (appletMessage: DeepLinkAppletMessage) => {
    const { routeName, params = {} } = appletMessage.data;
    switch (routeName) {
      case 'tiles/Today/Survey':
        openSurveyAppTile(params.questionnaire as string | undefined);
        break;

      case 'social/PostDetails':
        const { circleId, circleName } = params;
        if (circleId && circleName) {
          openCircleDiscussionScreen(circleId as string, circleName as string);
        }
        break;

      default:
        console.warn('Unsupported route name. Ignoring...', { routeName });
    }
  };

  const enforceWebURLProtocol = (url: string) => {
    const allowedProtocols = ['https://', 'http://'];
    const startsWithAllowedProtocol = allowedProtocols.some((protocol) =>
      url.startsWith(protocol),
    );
    return startsWithAllowedProtocol ? url : allowedProtocols[0].concat(url);
  };

  const handleOpenUrlMessage = async (appletMessage: OpenUrlAppletMessage) => {
    const { url } = appletMessage.data;
    const formattedURL = enforceWebURLProtocol(url);
    await Linking.openURL(formattedURL);
  };

  const handleAppTileMessage = (event: WebViewMessageEvent) => {
    const appTileMessage: AppTileMessage = JSON.parse(event.nativeEvent.data);
    switch (appTileMessage.type) {
      case AppTileMessageType.deepLink:
        handleDeepLinkMessage(appTileMessage);
        break;
      case AppTileMessageType.openUrl:
        handleOpenUrlMessage(appTileMessage);
        break;

      // no default
    }
  };

  const handleAppTileNavigationStateChange = (event: WebViewNavigation) => {
    if (event.url.indexOf('pending-lx-action') !== -1) {
      if (navigation.canGoBack()) {
        navigation.pop();
      }
    }
  };

  return { handleAppTileMessage, handleAppTileNavigationStateChange };
};
