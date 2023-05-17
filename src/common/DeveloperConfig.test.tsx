import React from 'react';
import { getCustomAppTileComponent } from './DeveloperConfig';

describe('getCustomAppTileComponent', () => {
  it('returns custom component if app tile matches', () => {
    const CustomComponent = () => <></>;
    const customAppTileComponent = getCustomAppTileComponent(
      {
        'http://unit-test/app-tile-1': CustomComponent,
      },
      {
        id: 'app-tile-1',
        title: 'test app tile',
        source: {
          url: 'http://unit-test/app-tile-1',
        },
      },
    );
    expect(customAppTileComponent).toEqual(CustomComponent);
  });

  it('returns false if app tile does not match', () => {
    const CustomComponent = () => <></>;
    const customAppTileComponent = getCustomAppTileComponent(
      {
        'http://unit-test/app-tile-2': CustomComponent,
      },
      {
        id: 'app-tile-1',
        title: 'test app tile',
        source: {
          url: 'http://unit-test/app-tile-1',
        },
      },
    );
    expect(customAppTileComponent).toBe(false);
  });

  it('returns true if url starts with bundleId, even if not configured', () => {
    const bundleId = 'com.unit-test.app'; // NOTE: the bundleId from react-native-device-info mock
    const customAppTileComponent = getCustomAppTileComponent(
      {},
      {
        id: 'app-tile-1',
        title: 'test app tile',
        source: {
          url: `${bundleId}://custom-screen`,
        },
      },
    );
    expect(customAppTileComponent).toBe(true);
  });
});
