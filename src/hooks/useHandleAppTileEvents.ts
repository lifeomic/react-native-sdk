import { useEffect, useState } from 'react';
import {
  EventListenerCallback,
  EventMapCore,
  useNavigation,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Linking } from 'react-native';
import type {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import { useTrackers } from '../components/TrackTile/hooks/useTrackers';
import {
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from '../components/TrackTile/services/TrackTileService';
import { HomeStackParamList } from '../navigators/types';
import { CircleTile, useAppConfig } from './useAppConfig';

type NavigationParams = {
  [x: string]: unknown | undefined;
  referenceDate?: string | number | Date;
};

type DeepLinkRouteName =
  | 'tiles/Today/Survey'
  | 'tiles/TrackTile'
  | 'social/PostDetails'
  | 'Home/YoutubePlayer';

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

type BeforeRemoveListener = EventListenerCallback<
  EventMapCore<any>,
  'beforeRemove'
>;

export const useHandleAppTileEvents = (webView: WebView | null = null) => {
  const { data } = useAppConfig();
  const { pillarTrackers } = useTrackers();
  const { todayTileSettings, tiles } = data?.homeTab || {};
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [blockGoBack, setBlockGoBack] = useState(false);

  useEffect(() => {
    const listener: BeforeRemoveListener = (e) => {
      if (blockGoBack) {
        e.preventDefault();
        webView?.goBack();
      }
    };

    navigation.addListener('beforeRemove', listener);

    return () => navigation.removeListener('beforeRemove', listener);
  }, [navigation, webView, blockGoBack]);

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

  const openYoutubePlayer = (youtubeVideoId: string, videoName?: string) => {
    navigation.push('Home/YoutubePlayer', { youtubeVideoId, videoName });
  };

  const openPillarTracker = (params: NavigationParams) => {
    const tracker = pillarTrackers.find((t) => t.metricId === params.metricId);
    if (!tiles?.includes('pillarsTile') || !tracker) {
      return;
    }

    navigation.push('Home/TrackTile', {
      tracker,
      ...(params.referenceDate
        ? { referenceDate: new Date(params.referenceDate) }
        : {}),
      valuesContext: {
        system: TRACKER_PILLAR_CODE_SYSTEM,
        codeBelow: TRACKER_PILLAR_CODE,
      },
    });
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

      case 'tiles/TrackTile':
        openPillarTracker(params);
        break;

      case 'Home/YoutubePlayer':
        const { youtubeVideoId, videoName } = params;
        openYoutubePlayer(
          youtubeVideoId as string,
          videoName as string | undefined,
        );

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
    const eventData = event.nativeEvent.data;
    if (!eventData) {
      return;
    }

    try {
      const appTileMessage: AppTileMessage = JSON.parse(eventData);
      switch (appTileMessage.type) {
        case AppTileMessageType.deepLink:
          handleDeepLinkMessage(appTileMessage);
          break;
        case AppTileMessageType.openUrl:
          handleOpenUrlMessage(appTileMessage);
          break;

        // no default
      }
    } catch (error) {
      console.warn('Error parsing app tile message', { eventData, error });
    }
  };

  const handleAppTileNavigationStateChange = (event: WebViewNavigation) => {
    if (event.url.indexOf('pending-lx-action') !== -1) {
      if (navigation.canGoBack()) {
        navigation.pop();
      }
    }

    setBlockGoBack(event.canGoBack && !!webView);
  };

  return { handleAppTileMessage, handleAppTileNavigationStateChange };
};
