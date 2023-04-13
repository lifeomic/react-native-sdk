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

  it('returns undefined if app tile does not match', () => {
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
    expect(customAppTileComponent).toBeUndefined();
  });
});
