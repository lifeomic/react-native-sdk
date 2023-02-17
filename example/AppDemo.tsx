import React, { FC } from 'react';
import { authConfig } from './storybook/stories/OAuth.stories';
import { RootProviders, RootStack } from '../src';

if (__DEV__) {
  import('./reactotron').then(() => console.log('Reactotron Configured'));
}

const App: FC = () => {
  return (
    <RootProviders authConfig={authConfig}>
      <RootStack />
    </RootProviders>
  );
};

export default App;
