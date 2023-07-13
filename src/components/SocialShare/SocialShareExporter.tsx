import React, { useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import ViewShot, { releaseCapture } from 'react-native-view-shot';
import Share from 'react-native-share';
import { useDeveloperConfig } from '../../hooks';
import { DeveloperConfig } from '../../common';
import { PointBreakdown } from './renderers/point-breakdown';
import { usePrevious } from '../TrackTile/hooks/usePrevious';

type Renderers = Required<DeveloperConfig>['sharingRenderers'];
type RendererKey = keyof Renderers;

type Props<T extends RendererKey> = {
  type: T;
  metadata: Omit<Parameters<Renderers[T]>[0], 'onLoad'>;
};

const defaultRenderers: Record<RendererKey, Renderers[RendererKey]> = {
  pointBreakdown: PointBreakdown,
};

export function SocialShareExporter<T extends RendererKey>({
  type,
  metadata,
}: Props<T>) {
  const { sharingRenderers } = useDeveloperConfig();
  const Renderer = sharingRenderers?.[type] ?? defaultRenderers[type];
  const viewShotRef = useRef<ViewShot>(null);
  const previous = usePrevious(metadata);

  const handleShare = useCallback(async () => {
    if (previous === metadata) {
      return;
    }

    const uri = (await viewShotRef.current?.capture?.()) ?? '';
    await Share.open({
      url: uri,
      type: 'image/jpeg',
      failOnCancel: false,
    });
    releaseCapture(uri);
  }, [metadata, previous]);

  if (!metadata) {
    return null;
  }

  return (
    <ViewShot
      ref={viewShotRef}
      style={{
        position: 'absolute',
        left: Dimensions.get('window').width,
        right: -Dimensions.get('window').width,
        top: 0,
      }}
      options={{ format: 'jpg' }}
    >
      <Renderer onLoad={handleShare} {...(metadata as any)} />
    </ViewShot>
  );
}
