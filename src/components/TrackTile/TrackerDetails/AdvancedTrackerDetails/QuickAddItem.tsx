import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Image,
  Text,
  ImageSourcePropType,
} from 'react-native';
import { useFontOverrides } from '../../styles';
import { Code } from '../../services/TrackTileService';
import { t } from '../../../../../lib/i18n';
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

export type QuickAddItemProps = {
  code: Code;
  image: ImageSourcePropType;
} & TouchableOpacityProps;

export const QuickAddItem = (props: QuickAddItemProps) => {
  const { code, image, ...touchableProps } = props;

  const { styles } = useStyles(defaultStyles);
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
        styles.container,
        touchableProps.disabled && styles.disabled,
        touchableProps.style,
      ]}
    >
      <Image style={styles.image} source={image} />
      <Text
        accessibilityElementsHidden
        style={[fontWeights.semibold, styles.text]}
      >
        {t('track-tile.quick-add-label', {
          defaultValue: '+ {{title}}',
          title: code.display,
        })}
      </Text>
    </TouchableOpacity>
  );
};

const defaultStyles = createStyles('QuickAddItem', () => ({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  disabled: {
    opacity: 0.3,
  },
  image: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  text: {
    marginHorizontal: 12,
    marginVertical: 6,
    lineHeight: 18,
    fontSize: 12,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
