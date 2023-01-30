# React Native Components

React-native components for building a mobile app against the LifeOmic Platform.

Checkout https://github.com/wix/react-native-ui-lib for some inspiration.  But
blur your eyes a bit, because we're not trying to launch into a fat components
lib.  So far, platform customers aren't interested in our components other than
how they relate to interacting with the platform and empower them to speed up
their app development.  Furthermore, our more novel and highly reusable
components such as [wearables config](https://github.com/lifeomic/wearables-ui)
and [trackers](https://github.com/lifeomic/track-tile-ui) already have repos of
their own.  When it comes time to open-source those for platform customers'
usage, we may want to entertain migrating those into this repo.  But that
decision doesn't matter at the time of writing.  What we need soon for platform
customers is the following:
* Helpers for auth and API session management
* The shell of an app: login, home, notifications, settings
* The ability to use that shell as-is, config it, and inject new screens into
it - OR take components/screens from it and use it an entirely different way

Reading the above, we probably want to rename the repo before open-sourcing.
`@lifeomic/react-native-components` might be too vague for what we're after.

## Development

The `example` app/folder should be used for all component demonstration
purposes.  Currently, it's solely used for storyboard / component development.
But if we were to want to showcase components in a different way, the same
`example` app should be used.

### Build and run the example app

-   `cd example`
-   `yarn install`
-   `cd ios && pod install && cd ../`
-   `npx react-native start`
-   type `i` or `a` to run on either platform

### (Optional) Navigate via the web

Sometimes the in app UI for viewing storybook actions and manipulating knobs
can be cumbersome.  If you have a lot of JSON to manipulate within a knob, for
example, you might consider controlling the mobile app UI from the web.  You
can do so following these steps:

-   `cd example`
-   `yarn web-controls`
-   Now, as you navigate components in the web app that just launched, the
    mobile app UI is updated.
