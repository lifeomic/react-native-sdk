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
import { RootProviders, LoggedInStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <RootProviders account="myaccount" authConfig={authConfig}>
      <LoggedInStack />
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
import { RootProviders, LoggedInStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        appTileScreens: {
          'https://mydomain.com/mobile-app-tiles/my-app-tile': MyCustomScreen,
        },
      }}
    >
      <RootProviders account="myaccount" authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### Simple custom theme via one color

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import { RootProviders, LoggedInStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        simpleTheme: {
          primaryColor: '#fb5607',
        },
      }}
    >
      <RootProviders account="myaccount" authConfig={authConfig}>
        <LoggedInStack />
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
import { RootProviders, LoggedInStack } from '@lifeomic/react-native-sdk';
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
      <RootProviders account="myaccount" authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### Custom Home screen

```typescript
const CustomHomeScreen = () => {
  const navigation = useNavigation<CustomHomeScreenNavigationProp>();
  const route = useRoute<UserDetailsScreenRouteProp>();

  return (
    <View>
      <Text>Custom Home Screen</Text>
    </View>
  );
};

function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        CustomHomeScreen,
      }}
    >
      <RootProviders account="myaccount" authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### Custom Login Screen

1- Define your custom login screen

```typescript
import React, { useCallback } from 'react';
import { useOAuthFlow } from '@lifeomic/react-native-sdk';
import { Text, View, Button } from 'react-native';
import { AuthorizeResult } from 'react-native-app-auth';

const CustomLoginScreen = () => {
  const { login } = useOAuthFlow();

  const onLoginPress = useCallback(() => {
    login({
      onSuccess: (result: AuthorizeResult) => {
        console.log('Login Success', result);
      },
      onFail: (error) => {
        console.log('Login Fail', error);
      },
    });
  }, [login]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Custom Login Screen</Text>
      <Button onPress={onLoginPress} title="Login" />
    </View>
  );
};
```

2- Pass in your custom login screen to the `DeveloperConfigProvider`

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import { RootProviders, LoggedInStack } from '@lifeomic/react-native-sdk';

export default function App() {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        renderCustomLoginScreen: () => <CustomLoginScreen />,
      }}
    >
      <RootProviders account="myaccount" authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### onAppSessionStart

`onAppSessionStart` is a function that is invoked when a new logged-in app
session starts (user sign-in/sign-up, app refresh, etc.). It can be used for
analytics purposes, checking subscription status, etc.

`onAppSessionStart` is invoked with an object containing a `resumeAppSession`.
The app session will be paused until `resumeAppSession` is invoked. Other params
are also passed, such as `activeSubjectId`.

```typescript
import React, { FC } from 'react';
import { authConfig } from './authConfig';
import {
  RootProviders,
  LoggedInStack,
  OnAppSessionStartParams,
} from '@lifeomic/react-native-sdk';

export default function App() {
  const onAppSessionStart = async ({
    resumeAppSession,
    activeProject,
    activeSubjectId,
  }: OnAppSessionStartParams) => {
    // track app session start metric
    await trackAppSessionStart();
    resumeAppSession();
  };

  return (
    <DeveloperConfigProvider
      developerConfig={{
        onAppSessionStart,
      }}
    >
      <RootProviders account="myaccount" authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
}
```

### Customizing the Default Login Screen with a Native View

The default login screen adds a long button to a native view with the name
`RNTLaunchScreen`.

1- To define an iOS launch screen, use an existing Storyboard, or create a new
one, and then create a module according to the
[official docs](https://reactnative.dev/docs/native-components-ios) that creates
an `RNTLaunchScreen` native view.

Example creating the native view for the `LaunchScreen` storyboard
(`RNTLaunchScreen.m`):

```objectivec
#import <React/RCTViewManager.h>

@interface RNTLaunchScreen : RCTViewManager
@end

@implementation RNTLaunchScreen

RCT_EXPORT_MODULE(RNTLaunchScreen)

- (UIView *)view
{
  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil];
  UIViewController *controller = [storyboard instantiateInitialViewController];

  [controller.view setAutoresizingMask:UIViewAutoresizingFlexibleWidth &
                                      UIViewAutoresizingFlexibleHeight];

  return controller.view;
}

@end
```

2- To define an android launch screen, use an existing View, or create a new
one, and then create a module according to the
[official docs](https://reactnative.dev/docs/native-components-android) that
registers an `RNTLaunchScreen` native view with the application.

Example creating a launch screen view from a layout and then registering the
launch screen `ReactPackage` with the `ReactApplication`:

<details>
  <summary>Create a layout at <code>res/layout/splash_screen.xml</code></summary>

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:layout_gravity="center_horizontal"
    android:background="#FFFFFF"
    android:weightSum="1">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight=".30"
        android:gravity="bottom|center"
        android:text="example"
        android:textColor="#000000"
        android:textSize="35dp"
        android:textStyle="bold" />

    <TextView
        android:id="@+id/subtitle"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight=".64"
        android:gravity="bottom|center"
        android:textSize="16dp"
        android:textColor="#000000"
        android:text="Powered by React Native" />
</LinearLayout>
```

</details>

<details>
  <summary>Create a <code>RNTLaunchScreen</code> class</summary>

```java
package com.example;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import android.view.View;
import java.util.Arrays;
import java.util.List;

public class RNTLaunchScreen extends SimpleViewManager<View> implements ReactPackage {
    public static final String REACT_CLASS = "RNTLaunchScreen";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public View createViewInstance(ThemedReactContext context) {
        return View.inflate(context, R.layout.splash_screen, null);
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(new RNTLaunchScreen());
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList();
    }
}
```

</details>

<details>
  <summary>Register the <code>RNTLaunchScreen</code> package with the <code>ReactApplication</code></summary>

```java
package com.example;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultReactNativeHost;
import java.util.List;
import com.example.RNTLaunchScreen;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new RNTLaunchScreen());
          return packages;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }
}
```

</details>

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

#### Development

To try out changes to this codebase in the starter app, run:

`yarn copyToStarter`

Or in your own app, run:

`yarn copyToProject my-custom-project`

#### Push Notifications for Android and Firebase services Integration Guide

Push notifications require `react-native-notifications` and Firebase services.
To integrate with your example app, follow the steps below:

##### 1. Add google-services.json

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

## Upgrading

For specific guidance on upgrading between versions of this SDK, see
[the upgrade guide](./UPGRADING.md).
