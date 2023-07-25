import React, { useCallback, useState } from 'react';
import { ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';
import { initials } from './initials';
import type { Post } from '../../hooks/Circles/types';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';
import { tID } from '../TrackTile/common/testID';

type Props = {
  post: Post;
  size: number;
  fallbackIcon: IconSource;
  style?: ViewStyle;
};

export const ProfileImage = ({ post, size, fallbackIcon, style }: Props) => {
  const { styles } = useStyles(defaultStyles);
  const [imageError, setImageError] = useState(false);
  const profileInitials = useCallback(
    () => (
      <Avatar.Text
        testID={tID('profile-image')}
        size={size}
        style={style}
        label={initials(post?.author?.profile?.displayName)}
      />
    ),
    [post?.author?.profile?.displayName, size, style],
  );

  if (post.author?.profile.picture) {
    return (
      <Avatar.Image
        testID={tID('profile-image')}
        size={size}
        style={style}
        source={
          imageError ? profileInitials : { uri: post.author.profile.picture }
        }
        onError={() => {
          setImageError(true);
        }}
      />
    );
  } else if (post.author?.profile.displayName) {
    return profileInitials();
  } else {
    return (
      <Avatar.Icon
        testID={tID('profile-image')}
        size={size}
        style={[styles.fallbackIconView, style]}
        icon={fallbackIcon}
      />
    );
  }
};

const defaultStyles = createStyles('ProfileImage', (theme) => ({
  fallbackIconView: { backgroundColor: theme.colors.surfaceDisabled },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ProfileImageStyle = NamedStylesProp<typeof defaultStyles>;
