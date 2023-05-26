import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Image,
  Text,
  ImageSourcePropType,
  View,
} from 'react-native';
import { useFontOverrides } from '../../styles';
import { createStyles, useIcons } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

export type TrackerValueRowProps = {
  hasBorderTop?: boolean;
  color: string;
  title: string;
  subTitle: string;
  image?: ImageSourcePropType;
} & TouchableOpacityProps;

export const TrackerValueRow = (props: TrackerValueRowProps) => {
  const { image, color, hasBorderTop, title, subTitle, ...rest } = props;

  const { Edit } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const fontWeights = useFontOverrides();

  return (
    <TouchableOpacity
      {...rest}
      style={[
        hasBorderTop && {
          borderTopWidth: styles.container?.borderBottomWidth,
          borderTopColor: styles.container?.borderBottomColor,
        },
        styles.container,
      ]}
    >
      <View>
        <Text style={[fontWeights.semibold, styles.titleText]}>{title}</Text>
        <Text style={[fontWeights.light, styles.subTitleText]}>{subTitle}</Text>
      </View>
      {image ? (
        <Image style={styles.image} source={image} />
      ) : (
        <View
          style={[
            {
              backgroundColor: color,
            },
            styles.image,
          ]}
        >
          <Edit color={'white'} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const defaultStyles = createStyles('TrackerValueRow', () => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
  },
  titleText: { fontSize: 16, marginBottom: 6, lineHeight: 19.2 },
  subTitleText: { fontSize: 12, lineHeight: 14.4 },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
