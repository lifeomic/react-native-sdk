import { gql } from 'graphql-request';

export enum ParentType {
  CIRCLE = 'CIRCLE',
  POST = 'POST',
}

export enum Priority {
  STANDARD = 'STANDARD',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum AttachmentType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  EVENT = 'EVENT',
  PDF = 'PDF',
}

export type Post = {
  __typename: string;
  authorId?: string;
  author?: {
    profile: {
      displayName: string;
      picture: string;
    };
  };
  id: string;
  parentId: string;
  priority?: Priority;
  replyCount: number;
  createdAt: string;
  deletedAt?: string;
  status: string;
  message?: string;
  attachments?: {}[];
  reactionTotals: {
    type: string;
    url?: string;
    count: number;
    userHasReacted?: boolean;
  }[];
  metadata?: unknown;
  replies: {
    edges: {
      node: Post;
    }[];
    pageInfo: {
      endCursor?: string;
      hasNextPage?: boolean;
    };
  };
};

export const postDetailsFragment = gql`
  fragment PostDetails on Post {
    id
    parentId
    createdAt
    priority
    ... on DeletedPost {
      deletedAt
    }
    ... on ActivePost {
      authorId
      message
      replyCount
      author {
        profile {
          displayName
        }
      }
      reactionTotals {
        type
        url
        count
        userHasReacted
      }
    }
  }
`;
