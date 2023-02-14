// import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useMe } from './useMe';
import { useUser } from './useUser';
import { useUserProfile } from './useUserProfile';

jest.mock('./useMe', () => ({
  useMe: jest.fn(),
}));
jest.mock('./useUser', () => ({
  useUser: jest.fn(),
}));

const useMeMock = useMe as jest.Mock;
const useUserMock = useUser as jest.Mock;

beforeEach(() => {
  useMeMock.mockReturnValue({
    data: { patientId: 'patientId' },
  });
  useUserMock.mockReturnValue({
    data: {
      id: 'userId',
      profile: {},
    },
  });
});

test('merges useMe and useUser into helpful state', async () => {
  const { result } = await renderHook(() => useUserProfile());
  expect(result.current.data).toMatchObject({
    userId: 'userId',
    profile: {},
    patientId: 'patientId',
  });
});

for (const prop of ['isLoading', 'isFetched', 'error']) {
  test(`exposes combined prop for ${prop}`, async () => {
    useMeMock.mockReturnValue({
      [prop]: true,
    });
    useUserMock.mockReturnValue({
      [prop]: false,
    });
    const { result, rerender } = await renderHook(() => useUserProfile());
    useMeMock.mockReturnValue({
      [prop]: false,
    });
    useUserMock.mockReturnValue({
      [prop]: true,
    });
    await rerender({});
    expect((result.current as any)[prop]).toEqual(true);
  });
}
