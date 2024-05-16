import { renderHook, waitFor, act } from '@testing-library/react-native';
import { ActiveAccountProvider } from '../useActiveAccount';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../useGraphQLClient';
import { mockGraphQLResponse } from '../../common/testHelpers/mockGraphQLResponse';
import {
  CreateAttachmentResponse,
  CreatePrivatePostAttachmentMutationResult,
  useCreatePrivatePostAttachmentMutation,
} from './usePrivatePosts';
import { AttachmentType } from './types';

jest.useFakeTimers();
jest.mock('../useUser', () => ({
  useUser: jest.fn().mockReturnValue({ data: { id: 'user1' } }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const renderHookWithInjectedClient = () => {
  return renderHook(() => useCreatePrivatePostAttachmentMutation(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ActiveAccountProvider account="unittest">
          <GraphQLClientContextProvider baseURL={baseURL}>
            {children}
          </GraphQLClientContextProvider>
        </ActiveAccountProvider>
      </QueryClientProvider>
    ),
  });
};

describe('useCreatePrivatePostAttachmentMutation', () => {
  test('returns query result', async () => {
    const response = {
      privatePostFileUploadUrl: {
        id: 'id',
        fileLocation: {
          permanentUrl: 'https://some-image-url',
          uploadUrl: 'https://some-upload-url',
        },
      } as CreatePrivatePostAttachmentMutationResult,
    };
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      undefined,
      response,
    );
    const fetchSpy = jest.spyOn(global, 'fetch');

    // Stub get blob call
    fetchSpy.mockResolvedValueOnce({
      blob: () => ({ isStubBlob: true, type: 'image/jpeg' }),
    } as any);
    // Stub s3 upload call
    fetchSpy.mockResolvedValueOnce({} as any);

    const { result } = renderHookWithInjectedClient();
    const { mutateAsync } = result.current;

    let attachment: CreateAttachmentResponse | undefined;
    await act(async () => {
      attachment = await mutateAsync({
        asset: {
          id: 'assetId',
          type: 'image/jpeg',
          uri: 'https://some-image-url',
        },
        userIds: ['user1', 'user2'],
      });
    });

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(attachment).toEqual({
        attachment: {
          externalId: response.privatePostFileUploadUrl.id,
          subType: 's3',
          type: AttachmentType.IMAGE,
        },
        uploadConfig: {
          ...response.privatePostFileUploadUrl,
          fileLocation: {
            ...response.privatePostFileUploadUrl.fileLocation,
            permanentUrl: 'https://some-image-url',
          },
        },
      });
    });

    expect(fetchSpy).toHaveBeenNthCalledWith(1, 'https://some-image-url');
    expect(fetchSpy).toHaveBeenNthCalledWith(2, 'https://some-upload-url', {
      headers: {
        'Content-Type': 'image/jpeg',
      },
      method: 'PUT',
      body: { isStubBlob: true, type: 'image/jpeg' },
    });
  });

  test('throws on missing asset type', async () => {
    expect.assertions(1);
    const { result } = renderHookWithInjectedClient();
    const { mutateAsync } = result.current;

    await act(async () => {
      try {
        await mutateAsync({
          asset: {
            id: 'assetId',
            type: undefined, // purpose of the test
            uri: 'https://some-image-url',
          },
          userIds: ['user1', 'user2'],
        });
      } catch (e) {
        expect(e).toEqual(new Error("Unknown asset type, can't upload"));
      }
    });
  });

  test('throws on unknown asset type', async () => {
    expect.assertions(1);
    const { result } = renderHookWithInjectedClient();
    const { mutateAsync } = result.current;

    await act(async () => {
      try {
        await mutateAsync({
          asset: {
            id: 'assetId',
            type: 'application/pdf', // purpose of the test
            uri: 'https://some-image-url',
          },
          userIds: ['user1', 'user2'],
        });
      } catch (e) {
        expect(e).toEqual(new Error('Unsupported file type: application/pdf'));
      }
    });
  });
});
