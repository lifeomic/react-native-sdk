import React from 'react';
import { TrackTile } from '../TrackTile/';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from '../../screens/HomeScreen';
import { useAppConfig } from '../../hooks/useAppConfig';

function TrackTileWrapper() {
  const navigation = useNavigation<HomeScreenNavigation>();
  const { data: appConfig } = useAppConfig();

  // TODO: Push this logic to the useAppConfig hook
  const trackTileEnabled = appConfig?.homeTab?.tiles?.includes?.('trackTile');
  const title = appConfig?.homeTab?.trackTileSettings?.title;

  if (!trackTileEnabled) {
    return null;
  }

  return (
    <TrackTile
      onOpenTracker={(tracker, valuesContext) =>
        navigation.navigate('tiles/TrackTile', {
          tracker,
          valuesContext,
        })
      }
      title={title}
    />
  );
}

export default TrackTileWrapper;
