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

- The `TabBar` styles have been removed from `BrandConfigProvider` and should
  now be provided as properties of the `TabBar` config on the `DeveloperConfig`
  for the individual tab.

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
        tabs: {
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
      },
    },
  }}
/>
```

- The Svg Props for a tabs defined in the `DeveloperConfig` have also been moved
  into a new style property on the tab.

Before:

```jsx
<DeveloperConfig
  developerConfig={{
    componentProps: {
      TabBar: {
        tabs: {
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
        tabs: {
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
      },
    },
  }}
/>
```
