import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
  Linking,
  I18nManager,
} from 'react-native';
import { useFontOverrides } from '../../styles';
import { Code } from '../../services/TrackTileService';
import { t } from '../../../../../lib/i18n';
import { createStyles, useIcons } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

export type CodingSubCategoryRowProps = TouchableOpacityProps & {
  code: Code;
  color: string;
  selected: boolean;
};

export const CodingSubCategoryRow = (props: CodingSubCategoryRowProps) => {
  const { code, color, selected, ...touchableProps } = props;
  const { ChevronLeft, ChevronRight } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const fontWeights = useFontOverrides();
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
      <TouchableOpacity style={styles.container} {...touchableProps}>
        <Text
          style={[
            fontWeights.semibold,
            styles.titleText,
            selected && { color },
          ]}
        >
          {code.display}
        </Text>
        <View
          style={[styles.radioContainer, selected && { borderColor: color }]}
        >
          {selected && (
            <View
              style={[
                {
                  backgroundColor: color,
                },
                styles.radioDotView,
              ]}
            />
          )}
        </View>
      </TouchableOpacity>

      {selected && code.educationContent && (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {code.educationContent.description}
          </Text>
          {code.educationContent?.url && (
            <TouchableOpacity
              onPress={() =>
                code.educationContent?.url &&
                Linking.openURL(code.educationContent.url)
              }
              style={styles.linkContainer}
            >
              <Text style={[fontWeights.semibold, styles.linkText]}>
                {t('track-tile.learn-more', {
                  defaultValue: 'Learn More',
                })}
              </Text>
              <Chevron height={21} width={21} color={styles.linkText?.color} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};

const defaultStyles = createStyles('CodingSubCategoryRow', () => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    paddingVertical: 12,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 16,
    color: '#35383D',
    marginBottom: 6,
    paddingTop: 6,
    lineHeight: 19.2,
  },
  radioContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotView: {
    width: '65%',
    height: '65%',
    borderRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: 35,
    paddingVertical: 12,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1,
    backgroundColor: '#F2F2F2',
  },
  contentText: {
    fontSize: 14,
    color: '#35383D',
    lineHeight: 21,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#02BFF1',
    lineHeight: 19.2,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
