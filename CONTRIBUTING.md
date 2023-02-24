## Development

This is a public repo. Any private LifeOmic repos (or references to them) cannot
go in here - please be careful.

Start in the README - make sure you understand everything in that file.

We are migrating several components & screens into this repo to enable customers
to build on our app shell within their own repo. Each PR is required to have a
semantic commit message like `fix`, `feat`, etc. For now, always use `fix` if
you want a release, or `chore` if you don't. We have a ways to go before this is
production ready, and we like small, focused PRs. When we're ready, we'll switch
to traditional semantic versioning after a minor or major release.

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

### Export everything, except default

Try not to use `export default`. If we use named exports everywhere, we can
`export * from ...` in index.ts files that facilitate what is available in the
npm lib. Try to export any/everything that might be useful for reuse, and try
not to do anything outside of a method (e.g. that will happen during `import`).
With that said, if you're working on something that isn't being purely migrated
into this repo and/or is being refactored on the way over, feel free to NOT
export it into an index file (for npm lib consumption) initially - to avoid
breaking changes during iteration.

If you're ever unsure of what is `import`able from the npm lib, clone the
react-native-starter repo locally, then run `yarn copyToStarter` in this repo's
directory. You can then consume the interface from within the starter repo
locally to find out what is exported and what is not.

### Example apps

The `example` app/folder should be used for all component demonstration
purposes. It's used for both storyboard / component development as well as
showing a full app demonstration. See README for how to toggle between the two
apps which are both served from the `example` folder.

### Coding preferences

- Prefer TypeScript's type inference over defining function types with
  `React.FC` - it is being deprecated.
- Prefer defining components with a single function declaration at the top of
  the file.
