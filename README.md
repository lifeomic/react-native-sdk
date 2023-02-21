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

### Peer dependencies strategy

We've seen a lot of pain when it comes to libraries shipping with dependencies
that either we have or other libraries also have. This can cause React to run
with multiple versions, one of the versions "wins" (in yarn.lock) and it's
unexpected, or other issues along these lines. For this reason, we want to not
be shy about peer dependencies, which keeps the library consumer in control of
those versions. On the other hand, this can become cumbersome if we get into the
10s of peer dependencies. Let's use these guidelines below.

#### It should be a peer dependency if:

- We think it's highly likely a consumer app will also use that library
- We know that if a consumer app uses a different version of the dependency, it
  will cause issues.
- There are corresponding Pods that need to be installed for iOS

If you are a LifeOmic customer, building a mobile app, and see a dependency that
you feel should be a peer dependency, reach out to us at
development@lifeomic.com.

### Export everything, except default

Try not to use `export default`. If we use named exports everywhere, we can
`export * from ...` in index.ts files that facilitate what is available in the
npm lib. Try to export any/everything that might be useful for reuse, and try
not to do anything outside of a method (e.g. that will happen during `import`).

### Example apps

The `example` app/folder should be used for all component demonstration
purposes. It's used for both storyboard / component development as well as
showing a full app demonstration. See below for how to toggle between the two
apps which are both served from the `example` folder.

#### Build and run the storybook example app

- `cd example`
- `cp .env.example .env`
- `yarn install`
- `cd ios && pod install && cd ../`
- `npx react-native start`
- type `i` or `a` to run on either platform

#### Build and run the full app demo app

- Run the example app as storybook first (previous section)
- Open `.env` and set `DEMO_APP` to `'true'`
- `npx react-native start` (from `example` folder)
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

### Gotchas

#### .env files not updating

react-native-config generates files (based on the .env file) via native build
scripts. Initially, and any time you update the `example/.env` file, you'll need
to run from Xcode for iOS or Android Studio for Android to ensure changes get
picked up. In Xcode, you may need to run a "Clean Build Folder" as well.

#### Android login not working locally

This can show itself with an "Invariant Violation" or "Invalid ID Token" error.
Or if there is no `onFail` is provided, nothing happens visually when tapping
the login button.

Try "wipe data" on the emulator and retrying. Sometimes the emulator clock gets
messed up so bad that the OAuth flow fails.

#### Cached IdP login due to cookies

We'll want to require
[react-native-app-auth 7.0](https://github.com/FormidableLabs/react-native-app-auth/releases/tag/v7.0.0-rc2)
as soon as it's fully released. We currently utilize the `/logout` endpoint to
alleviate much of this issue, but using `prefersEphemeralSession` will be a
better solution.
