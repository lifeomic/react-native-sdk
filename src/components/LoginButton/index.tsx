import { authorize } from 'react-native-app-auth';
import React, { FC, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';

type LoginButtonProps = {
};

export const LoginButton: FC<LoginButtonProps> = (_) => {
  const auth = useCallback(
    async () => {
      // setIsLoading(true);

      const config = {
        clientId: '71svpm9rgu22breagjrk0eh1c4',
        redirectUrl: 'com.myclientapp://myclient/redirect',
        serviceConfiguration: {
          authorizationEndpoint: 'https://lifeomic-prod-us.auth.us-east-2.amazoncognito.com/oauth2/authorize',
          tokenEndpoint: 'https://lifeomic-prod-us.auth.us-east-2.amazoncognito.com/oauth2/token',
          revocationEndpoint: 'https://lifeomic-prod-us.auth.us-east-2.amazoncognito.com/oauth2/revoke'
        },
        scopes: ['openid'],
      };

      // use the client to make the auth request and receive the authState
      try {
        const result = await authorize(config);

        console.warn('result', result);

        // result includes accessToken, accessTokenExpirationDate and refreshToken
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  return <TouchableOpacity onPress={auth} />
}