import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Image,
  Text,
  ImageSourcePropType,
} from 'react-native';
import { StylesProp, useFontOverrides, useStyleOverrides } from '../../styles';
import { Code } from '../../services/TrackTileService';
import { t } from 'i18next';

export type QuickAddItemProps = {
  code: Code;
  image: ImageSourcePropType;
} & TouchableOpacityProps;

export const QuickAddItem = (props: QuickAddItemProps) => {
  const { code, image, ...touchableProps } = props;

  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      testID={`tile-graphic-${code.display}`}
      accessibilityLabel={t('track-tile.quick-add-tracker-value', {
        defaultValue: 'Add {{type}}',
        type: code.display,
      })}
      {...touchableProps}
      style={[
        styles.quickAddItemContainer,
        touchableProps.disabled && styles.quickAddItemDisabled,
        touchableProps.style,
      ]}
    >
      <Image style={styles.quickAddItemImage} source={image} />
      <Text
        accessibilityElementsHidden
        style={[fontWeights.semibold, styles.quickAddItemText]}
      >
        {t('track-tile.quick-add-label', {
          defaultValue: '+ {{title}}',
          title: code.display,
        })}
      </Text>
    </TouchableOpacity>
  );
};

declare module './AdvancedTrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  quickAddItemContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  quickAddItemDisabled: {
    opacity: 0.3,
  },
  quickAddItemImage: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  quickAddItemText: {
    marginHorizontal: 12,
    marginVertical: 6,
    lineHeight: 18,
    fontSize: 12,
  },
});
