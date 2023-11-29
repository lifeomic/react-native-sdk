This document provides explicit instructions for upgrading between major
versions of this library.

### 1.x -> 2.x

- Replace your installation of `react-query@3.x` with
  `@tanstack/react-query@4.x`.

### 2.x -> 3.x

- The `useAccounts` hook was removed. Use
  `useRestQuery('GET /v1/accounts', ...)` instead.

- The `useAcceptInviteMutation` hooks was removed. Use
  `useRestMutation('PATCH /v1/invitations/:inviteId', ...)` instead.

### 3.x -> 4.x

- `react-native-mmkv` is now a peer dependency.

### 4.x -> 5.x

- `TabBar` default styles have changed. Run the app post upgrade if you use the
  `TabBar` to examine updated styles and apply overrides as needed (note,
  default tabs do not use `TabBar`).

- The `TabBar` styles have been removed from `BrandConfigProvider` and should
  now be provided as properties of the `TabBar` config on the `DeveloperConfig`
  for each individual tab.

Before:

```jsx
<BrandConfigProvider
  styles={{
    TabBar: {
      labelActiveText0: {
        backgroundColor: 'red',
      },
      labelInactive0Text: {
        backgroundColor: 'yellow',
      },
      activeIndicator0View: {
        backgroundColor: 'blue',
      },
      tabActive0View: {
        backgroundColor: 'green',
      },
      tabInactive0View: {
        backgroundColor: 'orange',
      },
    },
  }}
/>
```

After:

```jsx
<DeveloperConfig
  developerConfig={{
    componentProps: {
      TabBar: {
        tabs: [
          {
            name: 'Tab',
            component: SomeComponent,
            styles: {
              labelActiveText: {
                backgroundColor: 'red',
              },
              labelInactiveText: {
                backgroundColor: 'yellow',
              },
              activeIndicatorView: {
                backgroundColor: 'blue',
              },
              tabActiveView: {
                backgroundColor: 'green',
              },
              tabInactiveView: {
                backgroundColor: 'orange',
              },
            },
          },
        ],
      },
    },
  }}
/>
```

- The Svg Props for a tabs defined in the `DeveloperConfig` have also been moved
  into a new styles property on each tab.

Before:

```jsx
<DeveloperConfig
  developerConfig={{
    componentProps: {
      TabBar: {
        tabs: [
          {
            name: 'Tab',
            component: SomeComponent,
            svgProps: {
              color: 'red',
            },
            svgPropsActive: {
              color: 'yellow',
            },
            svgPropsInactive: {
              color: 'blue',
            },
          },
        ],
      },
    },
  }}
/>
```

After:

```jsx
<DeveloperConfig
  developerConfig={{
    componentProps: {
      TabBar: {
        tabs: [
          {
            name: 'Tab',
            component: SomeComponent,
            styles: {
              svgProps: {
                color: 'red',
              },
              svgPropsActive: {
                color: 'yellow',
              },
              svgPropsInactive: {
                color: 'blue',
              },
            },
          },
        ],
      },
    },
  }}
/>
```

### 5.x -> 6.x

- `RootStack` has been removed. Use `LoggedInStack` in it's place instead.

- `LoggedInProviders` will now render the login screen if the user is not logged
  in.

- If you are using a custom `BrandConfigProvider` as a child of `RootProviders`,
  you should move your locally-specific brand to the `DeveloperConfigProvider`
  instead. Example:

```tsx
// INSTEAD OF THIS:
const myBrand = {
  /* ... */
};
const App = () => {
  return (
    <DeveloperConfigProvider
      developerConfig={
        {
          /* ... */
        }
      }
    >
      <RootProviders authConfig={authConfig}>
        <BrandConfigProvider {...brand}>
          <RootStack />
        </BrandConfigProvider>
      </RootProviders>
    </DeveloperConfigProvider>
  );
};

// DO THIS:
const myBrand = {
  /* ... */
};
const App = () => {
  return (
    <DeveloperConfigProvider
      developerConfig={{
        brand: myBrand,
      }}
    >
      <RootProviders authConfig={authConfig}>
        <LoggedInStack />
      </RootProviders>
    </DeveloperConfigProvider>
  );
};
```

### 6.x -> 7.x

- `ActiveAccountContextProvider` and `ActiveProjectContextProvider` will now
  _not_ render their children until the active account + project have been
  resolved. If there is no active account or project, the `InviteRequired`
  screen will be rendered in the place of children.

- The `useActiveProject` hook now returns non-optional data. You can simplify
  any conditional logic around those returned values.

### 7.x -> 8.x

- `RootProviders` now requires an `account` prop. This should be set to the
  account id of the LifeOmic account you want your app to operate in.

```tsx
<RootProviders
  account="myaccount" // <-- add this
>
  {/* ... */}
</RootProviders>
```

- `useActiveAccount` now returns non-optional data. This can simplify any
  conditional logic around that data. For example:

```tsx
const MyComponent = () => {
  const { accountHeaders } = useActiveAccount();
  const query = useQuery(
    ['my-query'],
    () => client.get('/something', { headers: accountHeaders }),
    {
      enabled: !!accountHeaders,
    },
  );
};

// ^This can be simplified to:

const MyComponent = () => {
  const { accountHeaders } = useActiveAccount();
  const query = useQuery(['my-query'], () =>
    client.get('/something', { headers: accountHeaders }),
  );
};

// ^ No need to "wait" for the account to be resolved. It is always known.
```

- `ActiveAccountContextProvider` has been renamed and refactored into
  `ActiveAccountProvider`.

### 8.x -> 9.x

- The clients returned from `useHttpClient` and `useGraphQLClient` now
  automatically include the `LifeOmic-Account` header. You do not need to
  specify it manually. This also includes the `useRest****` hooks. Example:

```tsx
const MyComponent = () => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  const query = useQuery(['my-query'], () =>
    httpClient.get('/something', { headers: accountHeaders }),
  );
};

// This^ can be simplified to:
const MyComponent = () => {
  const { httpClient } = useHttpClient();
  const query = useQuery(['my-query'], () => httpClient.get('/something'));
  // the "accountHeaders" are included automatically.
};
```

- To _avoid_ including the `LifeOmic-Account` header, you can specify an empty
  string for the header value, like so: `'LifeOmic-Account': ''`. When that
  empty string is provided, the header will be removed from the request.
