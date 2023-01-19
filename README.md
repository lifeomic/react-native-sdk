# React Native Componentns

React-native components for building a mobile app against the LifeOmic Platform

## Development

NOTE: The react-native app within the "app" folder was generated from
[react-native-test-app](https://github.com/microsoft/react-native-test-app).
Keep this in mind when it's time for RN upgrades - should be helpful.

### Build and run the components app

-   `cd app`
-   `yarn install`
-   `cd ios && pod install && cd ../`
-   `npx react-native start`
-   type `i` or `a` to run on either platform

### (Optional) Navigate via the web

Sometimes the in app UI for viewing storybook actions and manipulating knobs
can be cumbersome.  If you have a lot of JSON to manipulate within a knob, for
example, you might consider controlling the mobile app UI from the web.  You
can do so following these steps:

-   `cd app`
-   `yarn start-storybook`
-   Now, as you navigate components in the web app that just launched, the
    mobile app UI is updated.
