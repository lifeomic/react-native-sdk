import React from 'react';
import { ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';
import { initials } from './initials';
import type { Post } from '../../hooks/Circles/types';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';

type Props = {
  post: Post;
  size: number;
  fallbackIcon: IconSource;
  style?: ViewStyle;
};

export const ProfileImage = ({ post, size, fallbackIcon, style }: Props) => {
  if (post.author?.profile.picture) {
    return (
      <Avatar.Image
        size={size}
        style={style}
        source={{ uri: post.author?.profile.picture }}
      />
    );
  } else if (post.author?.profile.displayName) {
    return (
      <Avatar.Text
        size={size}
        style={style}
        label={initials(post?.author?.profile?.displayName)}
      />
    );
  } else {
    return <Avatar.Icon size={size} style={style} icon={fallbackIcon} />;
  }
};
