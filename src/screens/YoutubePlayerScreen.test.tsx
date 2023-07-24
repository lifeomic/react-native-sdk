import React from 'react';
import { render } from '@testing-library/react-native';
import { YoutubePlayerScreen } from './YoutubePlayerScreen';

const route = { params: {} } as any;
const navigation = {} as any;
const YOUTUBE_VIDEO_ID = 'aHECp4wW5Hk';
const VIDEO_NAME = 'video name';

test('builds uri with code, projectId, patientId, and accountId', () => {
  route.params.youtubeVideoId = YOUTUBE_VIDEO_ID;
  route.params.videoName = VIDEO_NAME;
  const { getByTestId } = render(
    <YoutubePlayerScreen navigation={navigation} route={route} />,
  );
  const AppTileWebView = getByTestId('youtube-webview');
  const videoUrl = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?modestbranding=1&playsinline=1&showinfo=0&rel=0&autoplay=1" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"`;
  expect(AppTileWebView.props.source).toMatchObject({
    html: `<html><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" /><iframe src="${videoUrl}"></iframe></html>`,
  });
});
