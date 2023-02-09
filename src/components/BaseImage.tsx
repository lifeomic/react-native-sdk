import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FastImage, {
  FastImageProps,
  ResizeMode,
  ImageStyle,
  Source,
} from 'react-native-fast-image';

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
  },
  loadingContainer: {
    backgroundColor: '#F2F2F6',
  },
});

interface Props {
  accessibilityLabel?: string;
  testID?: string;
  options: Source;
  styleOverrides?: {
    image?: StyleProp<ImageStyle>;
    loading?: StyleProp<ViewStyle>;
  };
  resizeMode?: ResizeMode;
}

const BaseImage: React.FC<Props> = ({
  accessibilityLabel,
  testID,
  options,
  styleOverrides,
  resizeMode,
}) => {
  const [errorImage, setErrorImage] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const onLoadStart = React.useCallback(
    () => setLoadingImage(true),
    [setLoadingImage],
  );
  const onLoadEnd = React.useCallback(
    () => setLoadingImage(false),
    [setLoadingImage],
  );
  const source: FastImageProps['source'] = React.useMemo(
    () => ({
      ...options,
      cache: errorImage ? ('reload' as any) : options?.cache ?? 'web',
    }),
    [options, errorImage],
  );
  const onError = React.useCallback(() => setErrorImage(true), [setErrorImage]);

  return (
    <FastImage
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={StyleSheet.compose(styleOverrides?.image, styles.imageContainer)}
      resizeMode={resizeMode ?? 'contain'}
      source={source}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={onError}
      fallback={errorImage}
    >
      {loadingImage && (
        <View
          testID="image-loading"
          style={StyleSheet.compose(
            styleOverrides?.loading,
            styles.loadingContainer,
          )}
        />
      )}
    </FastImage>
  );
};

export default BaseImage;
