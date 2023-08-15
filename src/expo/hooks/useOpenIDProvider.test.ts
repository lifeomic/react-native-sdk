import { renderHook } from '@testing-library/react-native';
import { useOpenIDProvider, AuthConfig } from './useOpenIDProvider';
import {
  useAuthRequest,
  useAutoDiscovery,
  exchangeCodeAsync,
  TokenResponse,
  AuthRequest,
  AuthSessionResult,
} from 'expo-auth-session';

jest.mock('expo-auth-session', () => {
  const module = jest.requireActual('expo-auth-session');
  return {
    ...module,
    useAutoDiscovery: jest.fn(),
    useAuthRequest: jest.fn(),
    exchangeCodeAsync: jest.fn(),
  };
});

const issuer = 'http://issuer.io';

const config: AuthConfig = {
  issuer,
  clientId: 'client-id',
  redirectUri: `${issuer}/redirect`,
  serviceConfiguration: {
    authorizationEndpoint: `${issuer}/auth`,
    tokenEndpoint: `${issuer}/token`,
  },
  extraParams: {
    prompt: 'consent',
  },
  scopes: ['openid', 'profile', 'offline_access'],
};

jest.mocked(useAutoDiscovery).mockReturnValue({
  ...config.serviceConfiguration,
});

const code = 'code';

const promptSpy = jest.fn().mockReturnValue({
  type: 'success',
  params: {
    code,
  },
});

jest.mocked(useAuthRequest).mockReturnValue([null, null, promptSpy]);

const tokenResponse = {
  tokenType: 'bearer',
  accessToken: 'accessToken',
} as TokenResponse;

jest.mocked(exchangeCodeAsync).mockResolvedValue(tokenResponse);

describe('useOpenIDProvider', () => {
  test('on success makes code exchange for credentials', async () => {
    const { result } = renderHook(() => useOpenIDProvider(config));

    const authResult = await result.current();

    expect(authResult).toEqual({
      type: 'success',
      params: {
        code,
      },
      authentication: tokenResponse,
    });

    expect(useAutoDiscovery).toHaveBeenCalledWith(config.issuer);
    expect(useAuthRequest).toHaveBeenCalledWith(
      config,
      config.serviceConfiguration,
    );
    expect(exchangeCodeAsync).toHaveBeenCalledWith(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        code,
        redirectUri: config.redirectUri,
        scopes: config.scopes,
      },
      config.serviceConfiguration,
    );
  });

  test('includes code verifier in exchange when present', async () => {
    const codeVerifier = 'verifier';
    const { result, rerender } = renderHook(() => useOpenIDProvider(config));

    const authResult = result.current();
    jest
      .mocked(useAuthRequest)
      .mockReturnValue([{ codeVerifier } as AuthRequest, null, promptSpy]);

    rerender(() => useOpenIDProvider(config));

    expect(await authResult).toEqual({
      type: 'success',
      params: {
        code,
      },
      authentication: tokenResponse,
    });

    expect(exchangeCodeAsync).toHaveBeenCalledWith(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        code,
        redirectUri: config.redirectUri,
        scopes: config.scopes,
        extraParams: {
          code_verifier: codeVerifier,
        },
      },
      config.serviceConfiguration,
    );
  });

  const testCases: AuthSessionResult['type'][] = [
    'success',
    'cancel',
    'dismiss',
    'locked',
    'opened',
    'success',
  ];

  test.each(testCases)(
    'returns session result in other cases besides success with a code: %s',
    async (type) => {
      promptSpy.mockResolvedValue({
        type,
        params: {},
      });
      const { result } = renderHook(() => useOpenIDProvider(config));
      const authResult = await result.current();

      expect(authResult).toEqual({ type, params: {} });

      expect(exchangeCodeAsync).not.toHaveBeenCalled();
    },
  );
});
