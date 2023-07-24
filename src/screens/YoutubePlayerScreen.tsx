import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { HomeStackParamList } from '../navigators';

export const videoUrl = (youtubeVideoId: string) => {
  return `https://www.youtube.com/embed/${youtubeVideoId}?modestbranding=1&playsinline=1&showinfo=0&rel=0&autoplay=1" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"`;
};

export interface Params {
  youtubeVideoId: string;
  videoName: string;
}

export const onShouldStartLoadWithRequest = (
  videoPlayer: React.RefObject<WebView<{}>>,
  event: WebViewNavigation,
) => {
  if (event.url.indexOf('embed') !== -1 || event.url === 'about:blank') {
    return true;
  } else {
    videoPlayer.current && videoPlayer.current.stopLoading();
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  flexView: {
    flex: 1,
  },
  webView: {
    backgroundColor: 'black',
  },
});

type Props = NativeStackScreenProps<HomeStackParamList, 'Home/YoutubePlayer'>;

export const YoutubePlayerScreen = ({ route: { params } }: Props) => {
  const { youtubeVideoId } = params;
  const videoPlayer = React.createRef<WebView>();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.flexView}>
        <View style={styles.flexView}>
          <WebView
            scrollEnabled={false}
            style={styles.webView}
            ref={videoPlayer}
            originWhitelist={['*']}
            testID="youtube-webview"
            source={{
              html: `<html><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" /><iframe src="${videoUrl(
                youtubeVideoId,
              )}"></iframe></html>`,
            }}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest.bind(
              null,
              videoPlayer,
            )} //  iOS
            onNavigationStateChange={onShouldStartLoadWithRequest.bind(
              null,
              videoPlayer,
            )} // Android
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
