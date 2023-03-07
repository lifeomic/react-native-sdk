# React Native SDK

[![npm](https://img.shields.io/npm/v/@lifeomic/react-native-sdk.svg)](https://www.npmjs.com/package/@lifeomic/react-native-sdk)
[![Build Status](https://github.com/lifeomic/react-native-sdk/actions/workflows/release.yml/badge.svg)](https://github.com/lifeomic/react-native-sdk/actions/workflows/release.yml)
[![Coverage Status](https://coveralls.io/repos/github/lifeomic/react-native-sdk/badge.svg?branch=master)](https://coveralls.io/github/lifeomic/react-native-sdk?branch=master)

React-native hooks, components, screens, and utilities for building a mobile app
against the LifeOmic Platform.

## Getting started using the SDK

Start with your own RN app, or clone [@lifeomic/react-native-starter] as a
starting point.

- `yarn add @lifeomic/react-native-sdk`
- Install peer dependencies listed in `package.json`
- `cd ios && pod install && cd ../`

See `example/AppDemo.tsx` for simple usage, which could be as simple as:

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import { RootProviders, RootStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <RootProviders authConfig={authConfig}>
      <RootStack />
    </RootProviders>
  );
}
```

> :warning: The OAuth client in the `example/.env.example` file may not be used
> beyond demonstration purposes. You will need to [contact us] to request an
> OAuth client for your account.

### Peer dependencies

We may have more peer dependencies than is typical. We have run into a number of
issues with multiple libraries fighting over dependency versions, so we want to
put you in control of managing which version is used in your app. This also
keeps you more informed about the libraries utilized under the covers.

If you are a LifeOmic customer, building a mobile app, and see a dependency in
this SDK that you feel should be a peer dependency, [contact us].

## Component demos

### Example apps

The `example` app/folder contains storyboard component stories as well as a full
app demonstration. See below for how to toggle between the two apps, which are
both served from the `example` folder.

#### Build and run the storybook example app

- Clone this repo locally and `cd` into the project folder
- `cd example`
- `cp .env.example .env`
- `yarn install`
- `cd ios && pod install && cd ../`
- `npx react-native start`
- type `i` or `a` to run on either platform

#### (Optional) Navigate storybook via the web

Sometimes the in-app UI for viewing storybook actions and manipulating knobs can
be cumbersome. If you have a lot of JSON to manipulate within a knob, for
example, you might consider controlling the mobile app UI from the web. You can
do so following these steps:

- `cd example`
- `yarn web-controls`
- Now, as you navigate components in the web app that just launched, the mobile
  app UI is updated.

NOTE: If you don't see a components tree on the left, you may need to reload the
mobile app UI.

#### Build and run the full app demo app

- Run the example app as storybook first (previous section)
- Open `.env` and set `DEMO_APP` to `'true'`
- `npx react-native start` (from `example` folder)
- type `i` or `a` to run on either platform

## Gotchas

### .env files not updating

react-native-config generates files (based on the .env file) via native build
scripts. Initially, and any time you update the `example/.env` file, you'll need
to take extra steps to ensure changes get picked up.

For Android do the build from Android Studio.

For iOS you can run "Clean Build Folder" from Xcode or:
`xcodebuild -workspace ./ios/example.xcworkspace -scheme example clean`

### Android login not working locally

This can show itself with an "Invariant Violation" or "Invalid ID Token" error.
Or if no `onFail` is provided, nothing happens visually when tapping the login
button.

Try "wipe data" on the emulator and retrying. Sometimes the emulator clock gets
messed up so bad that the OAuth flow fails.

### Cached IdP login due to cookies

We'll want to require
[react-native-app-auth 7.0](https://github.com/FormidableLabs/react-native-app-auth/releases/tag/v7.0.0-rc2)
as soon as it's fully released. We currently utilize the `/logout` endpoint to
alleviate much of this issue, but using `prefersEphemeralSession` will be a
better solution.

[@lifeomic/react-native-starter]:
  https://github.com/lifeomic/react-native-starter
[contact us]: https://lifeomic.com/contact/
