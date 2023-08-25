// This file is useful when you need to share the same type across several
// files and don't want to import any of the consuming source files.

export interface ProjectInvite {
  id: string;
  account: string;
  accountName: string;
  email: string;
  status: string;
  expirationTimestamp: string;
  purpose?: string;
}

export interface User {
  id: string;
  profile: {
    email: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
  };
}
