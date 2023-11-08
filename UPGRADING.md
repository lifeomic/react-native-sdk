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
