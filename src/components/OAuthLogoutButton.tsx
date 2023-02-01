import React, { FC, useCallback } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LogoutParams, useOAuthFlow } from '../hooks/useOAuthFlow';

type OAuthLogoutButtonParams = Omit<TouchableOpacityProps, 'onPress'> &
  LogoutParams & {
    children?: React.ReactNode;
  };

export const OAuthLogoutButton: FC<OAuthLogoutButtonParams> = ({
  onSuccess,
  onFail,
  children,
  ...touchableOpacityProps
}) => {
  const { isLoggedIn } = useAuth();
  const { logout } = useOAuthFlow();

  const _logout = useCallback(async () => {
    await logout({
      onSuccess,
      onFail,
    });
  }, [logout, onSuccess, onFail]);

  return (
    <TouchableOpacity
      {...touchableOpacityProps}
      disabled={!isLoggedIn}
      onPress={_logout}
    >
      {children}
    </TouchableOpacity>
  );
};
