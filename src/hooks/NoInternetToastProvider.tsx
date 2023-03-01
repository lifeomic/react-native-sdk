import React, { createContext, useEffect, useRef, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { t } from 'i18next';
import Toast, { ToastProps } from 'react-native-toast-message';

export const NoInternetToastContext = createContext({});

class NoInternetToastProviderProps {
  children?: React.ReactNode;
  toastOverrides?: ToastProps;
  /** Simulate the connection state (useful for testing) */
  _isConnected?: boolean;
}

export const NoInternetToastProvider = ({
  children,
  toastOverrides,
  _isConnected,
}: NoInternetToastProviderProps) => {
  const { isConnected } = useNetInfo();
  const hiddenByAPI = useRef<boolean>(false);
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (_isConnected === false || isConnected === false) {
      hiddenByAPI.current = false;
      Toast.show({
        type: 'error',
        text1: t('connection-error-title', 'No internet connection ❌'),
        text2: t(
          'connection-error-body',
          'This app requires an internet connection.',
        ),
        autoHide: false,
        onHide: () => {
          if (hiddenByAPI.current === false) {
            // If dismissed by a user force a rerender
            // so the toast is shown again
            setForceRefresh((currentValue) => !currentValue);
          } else {
            hiddenByAPI.current = false;
          }
        },
        ...toastOverrides,
      });
    } else if (_isConnected === true || isConnected === true) {
      hiddenByAPI.current = true;
      Toast.hide();
    }
  }, [isConnected, toastOverrides, forceRefresh, _isConnected]);

  return (
    <NoInternetToastContext.Provider value={{}}>
      {children}
    </NoInternetToastContext.Provider>
  );
};
