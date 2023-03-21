import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Image,
  Text,
  ImageSourcePropType,
  View
} from 'react-native';
import { StylesProp, useFontOverrides, useStyleOverrides } from '../../styles';
import { Edit } from '@lifeomic/chromicons-native';
import { useFlattenedStyles } from '../../hooks/useFlattenedStyles';

export type TrackerValueRowProps = {
  hasBorderTop?: boolean;
  color: string;
  title: string;
  subTitle: string;
  image?: ImageSourcePropType;
} & TouchableOpacityProps;

export const TrackerValueRow = (props: TrackerValueRowProps) => {
  const { image, color, hasBorderTop, title, subTitle, ...rest } = props;

  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();
  const flatStyles = useFlattenedStyles(styles, ['trackerValueRowContainer']);

  return (
    <TouchableOpacity
      {...rest}
      style={[
        hasBorderTop && {
          borderTopWidth: flatStyles.trackerValueRowContainer.borderBottomWidth,
          borderTopColor: flatStyles.trackerValueRowContainer.borderBottomColor
        },
        styles.trackerValueRowContainer
      ]}
    >
      <View>
        <Text style={[fontWeights.semibold, styles.trackerValueRowTitle]}>
          {title}
        </Text>
        <Text style={[fontWeights.light, styles.trackerValueRowSubTitle]}>
          {subTitle}
        </Text>
      </View>
      {image ? (
        <Image style={styles.trackerValueRowImage} source={image} />
      ) : (
        <View
          style={[
            {
              backgroundColor: color
            },
            styles.trackerValueRowImage
          ]}
        >
          <Edit color={'white'} />
        </View>
      )}
    </TouchableOpacity>
  );
};

declare module './AdvancedTrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  trackerValueRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)'
  },
  trackerValueRowTitle: { fontSize: 16, marginBottom: 6, lineHeight: 19.2 },
  trackerValueRowSubTitle: { fontSize: 12, lineHeight: 14.4 },
  trackerValueRowImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },

  quickAddItemContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  quickAddItemDisabled: {
    opacity: 0.3
  },
  quickAddItemImage: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    resizeMode: 'cover'
  },
  quickAddItemText: {
    marginHorizontal: 12,
    marginVertical: 6,
    lineHeight: 18,
    fontSize: 12
  }
});
