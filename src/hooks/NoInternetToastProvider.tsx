import React, { createContext, useEffect, useRef, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { t } from 'i18next';
import Toast, { ToastProps } from 'react-native-toast-message';

export const NoInternetToastContext = createContext({});

class NoInternetToastProviderProps {
  children?: React.ReactNode;
  toastOverrides?: ToastProps;
}

export const NoInternetToastProvider = ({
  children,
  toastOverrides,
}: NoInternetToastProviderProps) => {
  const { isConnected } = useNetInfo();
  const hiddenByAPI = useRef<boolean>(false);
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (isConnected === false) {
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
    } else if (isConnected === true) {
      hiddenByAPI.current = true;
      Toast.hide();
    }
  }, [isConnected, toastOverrides, forceRefresh]);

  return (
    <NoInternetToastContext.Provider value={{}}>
      {children}
    </NoInternetToastContext.Provider>
  );
};
