import React from 'react';
import { render } from '@testing-library/react-native';
// @ts-ignore
import RNCNetInfoMock from '@react-native-community/netinfo/jest/netinfo-mock';
import { NoInternetToastProvider } from './NoInternetToastProvider';
import Toast from 'react-native-toast-message';

describe('NoInternetToast', () => {
  test('shows and hides on connection state change', () => {
    RNCNetInfoMock.useNetInfo.mockReturnValue({
      isConnected: false,
    });

    const mockOnShow = jest.fn();
    const mockOnHide = jest.fn();
    const { rerender } = render(
      <NoInternetToastProvider
        toastOverrides={{ onHide: mockOnHide, onShow: mockOnShow }}
      >
        <Toast />
      </NoInternetToastProvider>,
    );

    expect(mockOnShow).toHaveBeenCalledTimes(1);

    RNCNetInfoMock.useNetInfo.mockReturnValue({ isConnected: true });
    rerender(
      <NoInternetToastProvider
        toastOverrides={{ onHide: mockOnHide, onShow: mockOnShow }}
      >
        <Toast />
      </NoInternetToastProvider>,
    );

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
