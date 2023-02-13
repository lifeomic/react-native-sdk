import i18n from 'lib/i18n';
import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
const defaultSize = 80;
const defaultFontSize = 32;

export interface Props {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: number;
  user: {
    userId: string;
    profile?: {
      displayName: string | null;
      picture?: string | null;
    };
  };
  customBackgroundStyle?: StyleProp<ViewStyle>;
  imageUri?: string;
}

export const imageWrapperStyles: StyleProp<ViewStyle> = {
  backgroundColor: '#02BFF1', // light blue
  borderColor: '#EFEFF4', // light gray
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
};

const styles = StyleSheet.create({
  imageWrapper: imageWrapperStyles,
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  loadingImage: {
    width: defaultSize,
    height: defaultSize,
    borderRadius: defaultSize / 2,
    backgroundColor: '#EFEFF4', // light gray
  },
  text: {
    color: 'white',
    fontSize: defaultFontSize,
  },
});

export const getInitials = (value: string | null, limit = 2) => {
  if (!value) {
    return '';
  }
  const names = value.split(' ').slice(0, limit);
  const initials = names.map((name) => {
    const letters = [...name];
    const firstLetter = letters[0];
    return firstLetter && firstLetter.toLocaleUpperCase();
  });
  return initials.join('');
};

type ProfileImageModel = Pick<
  Props,
  'style' | 'textStyle' | 'size' | 'customBackgroundStyle'
> & {
  sizeStyle: { width: number; height: number; borderRadius: number };
  fontSize: number;
  initials: string;
  picture?: string;
  initialsStyle: TextStyle;
};

const ProfileImagePresenter = ({
  user,
  size = defaultSize,
  imageUri,
  ...rest
}: Props): ProfileImageModel => {
  const sizeRatio = size / defaultSize;
  const fontSize = defaultFontSize * sizeRatio;

  return {
    sizeStyle: {
      width: size,
      height: size,
      borderRadius: size,
    },
    size,
    picture: imageUri || (user?.profile?.picture ?? undefined),
    initials: getInitials(user.profile ? user.profile.displayName : ''),
    initialsStyle: {
      fontSize,
    },
    fontSize,
    ...rest,
  };
};

const ProfileImage: React.FC<Props> & { Loading: React.FC } = (props) => {
  const {
    sizeStyle,
    style,
    size,
    customBackgroundStyle,
    picture,
    textStyle,
    initials,
    initialsStyle,
  } = ProfileImagePresenter(props);
  return (
    <View
      style={[
        style,
        {
          height: size,
          width: size,
        },
      ]}
    >
      <View style={[styles.imageWrapper, sizeStyle, customBackgroundStyle]}>
        {picture ? (
          <Image
            style={styles.image}
            source={{
              uri: picture,
            }}
            testID="profile-image"
            accessibilityLabel={i18n.t('profile-image', 'Profile image')}
          />
        ) : (
          <Text style={[styles.text, initialsStyle, textStyle]}>
            {initials}
          </Text>
        )}
      </View>
    </View>
  );
};

ProfileImage.Loading = function ProfileImageLoading() {
  return (
    <View
      style={styles.loadingImage}
      accessibilityRole="image"
      accessibilityLabel={i18n.t('9bb87d267f1dd9ad27e62483db3d5066', {
        defaultValue: 'Loading profile',
      })}
    />
  );
};

export default ProfileImage;
