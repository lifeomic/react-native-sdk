/**
 * While performing authorization through an external user-agent (browser)
 * is recommended and the only way to be OAuth 2.0 compliant, there are
 * publicly available endpoints that can be used to build a fully native
 * experience.
 */
export type AppsAPIEndpoints = {
  'POST /auth/v1/api/invite-validations': {
    Request: {
      inviteId: string;
      evc: string;
    };
    Response: {
      userState: {
        isExistingUser: boolean;
      };
      invitation: {
        email: string;
        group: string;
        project: string;
      };
    };
  };
  'POST /auth/v1/api/signup': {
    Request: {
      clientId: string;
      email: string;
      /**
       * evc, originalUrl, inviteId are not technically required, but it
       * is the only way we currently support signup through POST /signup
       */
      originalUrl: string;
      evc: string;
      inviteId: string;
    };
    Response:
      | {
          userConfirmed?: false;
        }
      | {
          userConfirmed: true;
          accessToken: string;
          refreshToken: string;
          identityToken: string;
          expiresIn: number;
          tokenType: 'Bearer';
          originalUrl: string;
        };
  };
};
