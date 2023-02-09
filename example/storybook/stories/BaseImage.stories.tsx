import { files, object, select } from '@storybook/addon-knobs';
import React from 'react';
import BaseImage from 'src/components/BaseImage';
import type { ResizeMode } from 'react-native-fast-image';
import { ImageStyle } from 'react-native-fast-image';
import { storiesOf } from '@storybook/react-native';

storiesOf('BaseImage', module).add('demo', () => {
  const imageStyle = object('imageStyle', {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  }) as ImageStyle;

  const resizeModes: ResizeMode[] = ['contain', 'cover', 'stretch', 'center'];
  const resizeMode = select('resizeMode', resizeModes, undefined);

  const label = 'Images';
  const accept = '.png';
  const defaultValue: any[] = [];

  const fileUris = files(label, accept, defaultValue, '');
  return (
    <BaseImage
      styleOverrides={{ image: imageStyle }}
      resizeMode={resizeMode}
      options={{
        uri: fileUris.length ? fileUris[0] : undefined,
      }}
    />
  );
});
