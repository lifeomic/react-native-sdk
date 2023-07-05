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
- `yarn pod-install`

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

> :warning: The OAuth client in the `example/config.example.ts` file may not be
> used beyond demonstration purposes. You will need to [contact us] to request
> an OAuth client for your account.

### Custom app tile screens

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import { MyCustomScreen } from './src/MyCustomScreen';
import { RootProviders, RootStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        appTileScreens: {
          'https://mydomain.com/mobile-app-tiles/my-app-tile': MyCustomScreen,
        },
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### Simple custom theme via one color

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import { RootProviders, RootStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        simpleTheme: {
          primaryColor: '#fb5607',
        },
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### Inject custom screens to the root stack

1- Define your own custom screens.

```typescript
import React from 'react';
import { StyleSheet, Text, Button } from 'react-native';
import { HomeStackParamList } from '@lifeomic/react-native-sdk';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type CustomHomeStackParamsList = HomeStackParamList & {
  'CustomHomeScreen/Users': undefined;
  'CustomHomeScreen/UserDetails': { userId: string };
};

type UserDetailsScreenNavigationProp = NativeStackNavigationProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen/Users'
>;

type UserDetailsScreenRouteProp = RouteProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen/Users'
>;

export const UsersScreen = () => {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>();
  const route = useRoute<UserDetailsScreenRouteProp>();

  return (
    <>
      <Text>Users</Text>
      <Button
        title="Navigate to the user details screen"
        onPress={() =>
          navigation.navigate('CustomHomeScreen/UserDetails', { userId: '123' })
        }
      />
    </>
  );
};
```

2- Add your custom screens to the Home navigation stack.

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import { RootProviders, RootStack } from '@lifeomic/react-native-sdk';
import { UserDetailsScreen, UsersScreen } from './screens';

export default function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        getAdditionalHomeScreens: (HomeStack) => {
          return [
            <HomeStack.Screen
              name="CustomHomeScreen/Users"
              component={UsersScreen}
            />,
            <HomeStack.Screen
              name="CustomHomeScreen/UserDetails"
              component={UserDetailsScreen}
            />,
          ];
        },
      }}
    >
      <RootProviders authConfig={authConfig}>
        <RootStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

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
- `cp config.example.ts config.ts`
- `yarn install`
- `yarn pod-install`
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
- Open `example/config.ts` and set `useDemoApp` to `'true'`
- `npx react-native start` (from `example` folder)
- type `i` or `a` to run on either platform

#### Push Notifications for Android and Firebase services Integration Guide

Push notifications require `react-native-notifications` and Firebase services.
To integrate with your example app, follow the steps below:

##### 1. Modify MainApplication.java

Uncomment the following imports in the `MainApplication.java` file:

```
import com.google.firebase.FirebaseApp;
import com.wix.reactnativenotifications.RNNotificationsPackage;
```

Uncomment the line that initializes Firebase in the `MainApplication.java` file:

```
FirebaseApp.initializeApp(this);
```

##### 2. Update package.json

In the example folder, add `react-native-notifications` to the dependencies
section the the package.json file:

```
"dependencies": {
  "react-native-notifications": "^4.3.5",
  // other dependencies...
}
```

example: `cd example && yarn add react-native-notifications`

##### 3. Add google-services.json

Please bring in your own `google-services.json` file and add it to the
appropriate location in your project. The `google-services.json` file is
required for Firebase services to work correctly.

Make sure to follow the Firebase documentation to obtain the
`google-services.json` file specific to your Firebase project.

#### Generate the Apple Push Notification service (APNs) certificate

In order to receive push notifications on iOS, you will need to generate an APNs
certificate. Please follow
[these steps](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_certificate-based_connection_to_apns#2947597)
to generate the certificate.

#### 4. Add Firebase Cloud Messaging (FCM) Server Key

LifeOmic uses Firebase Cloud Messaging (FCM) to send push notifications to
Android devices. AWS expects the Firebase Server key, which is part of the
now-deprecated Cloud Messaging API. As of the time of this writing, the only
known solution is to enable the Cloud Messaging API in Firebase under
`project -> Project Settings -> General -> Cloud Messaging API -> Manange -> Enable`.
Refreshing the Project Settings page should reveal the Server key.

## Gotchas

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
