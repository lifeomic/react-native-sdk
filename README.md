# React Native Components

Public react-native components for building a mobile app against the LifeOmic
Platform.

Checkout https://github.com/wix/react-native-ui-lib for some inspiration. But
blur your eyes a bit, because we're not trying to launch into a fat components
lib. What we need soon for platform customers is the following:

- Helpers for auth and API session management
- The shell of an app: login, home, notifications, settings
- The ability to use that shell as-is, config it, and inject new
  screens/functionality into it

## Development

This is a public repo. Any private LifeOmic repos (or references to them) cannot
go in here - please be careful.

We are migrating several components & screens into this repo to enable customers
to build on our app shell within their own repo. Each PR is required to have a
semantic commit message like `fix`, `feat`, etc. For now, always use `fix` or
`chore` because we have a ways to go and we like small focused PRs.

### Example app

The `example` app/folder should be used for all component demonstration
purposes. Currently, it's solely used for storyboard / component development.
But if we were to want to showcase components in a different way, the same
`example` app should be used.

#### Build and run the example app

- `cd example`
- `cp .env.example .env`
- `yarn install`
- `cd ios && pod install && cd ../`
- `npx react-native start`
- type `i` or `a` to run on either platform

#### (Optional) Navigate via the web

Sometimes the in app UI for viewing storybook actions and manipulating knobs can
be cumbersome. If you have a lot of JSON to manipulate within a knob, for
example, you might consider controlling the mobile app UI from the web. You can
do so following these steps:

- `cd example`
- `yarn web-controls`
- Now, as you navigate components in the web app that just launched, the mobile
  app UI is updated.

NOTE: If you don't see a components tree on the left, you may need to reload the
mobile app UI.

### Gotchas

#### .env files not updating

react-native-config generates files (based on the .env file) via native build
scripts. Initially, and any time you update the `example/.env` file, you'll need
to run from Xcode for iOS or Android Studio for Android to ensure changes get
picked up. In Xcode, you may need to run a "Clean Build Folder" as well.

#### "Invariant Violation" for Android login

Try "wipe data" on the emulator and retrying. Sometimes the clock gets messed up
so bad on the emulator that the OAuth flow fails.

#### Cached IdP login due to cookies

We'll want to require
[react-native-app-auth 7.0](https://github.com/FormidableLabs/react-native-app-auth/releases/tag/v7.0.0-rc2)
as soon as it's fully released. We currently utilize the `/logout` endpoint to
alleviate much of this issue, but using `prefersEphemeralSession` will be a
better solution.
