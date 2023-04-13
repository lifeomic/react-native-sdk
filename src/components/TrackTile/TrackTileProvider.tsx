import React from 'react';
import { TrackTileServiceProvider } from './services/TrackTileService';
import { useAxiosTrackTileService } from './main';

export type Props = {
  children: React.ReactNode;
};

export function TrackTileProvider({ children }: Props) {
  const trackTileService = useAxiosTrackTileService();
  return (
    <TrackTileServiceProvider value={trackTileService}>
      {children}
    </TrackTileServiceProvider>
  );
}
