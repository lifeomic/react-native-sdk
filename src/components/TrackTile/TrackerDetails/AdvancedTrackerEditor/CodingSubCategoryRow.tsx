import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
  StyleSheet,
  Linking,
  I18nManager,
} from 'react-native';
import { StylesProp, useFontOverrides, useStyleOverrides } from '../../styles';
import { useFlattenedStyles } from '../../hooks/useFlattenedStyles';
import { Code } from '../../services/TrackTileService';
import { ChevronRight, ChevronLeft } from '@lifeomic/chromicons-native';
import { t } from '@i18n';

export type CodingSubCategoryRowProps = TouchableOpacityProps & {
  code: Code;
  color: string;
  selected: boolean;
};

export const CodingSubCategoryRow = (props: CodingSubCategoryRowProps) => {
  const { code, color, selected, ...touchableProps } = props;
  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  const flatStyles = useFlattenedStyles(styles, [
    'codingSubCategoryRowContentLink',
  ]);

  return (
    <>
      <TouchableOpacity
        style={styles.codingSubCategoryRowContainer}
        {...touchableProps}
      >
        <Text
          style={[
            fontWeights.semibold,
            styles.codingSubCategoryRowTitle,
            selected && { color },
          ]}
        >
          {code.display}
        </Text>
        <View
          style={[
            styles.codingSubCategoryRowRadioCircle,
            selected && { borderColor: color },
          ]}
        >
          {selected && (
            <View
              style={[
                {
                  backgroundColor: color,
                },
                styles.codingSubCategoryRowRadioDot,
              ]}
            />
          )}
        </View>
      </TouchableOpacity>

      {selected && code.educationContent && (
        <View style={styles.codingSubCategoryRowContentContainer}>
          <Text style={styles.codingSubCategoryRowContentText}>
            {code.educationContent.description}
          </Text>
          {code.educationContent?.url && (
            <TouchableOpacity
              onPress={() =>
                code.educationContent?.url &&
                Linking.openURL(code.educationContent.url)
              }
              style={styles.codingSubCategoryRowContentLinkContainer}
            >
              <Text
                style={[
                  fontWeights.semibold,
                  styles.codingSubCategoryRowContentLink,
                ]}
              >
                {t('track-tile.learn-more', {
                  defaultValue: 'Learn More',
                })}
              </Text>
              <Chevron
                height={21}
                width={21}
                color={flatStyles.codingSubCategoryRowContentLink.color}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};

declare module './AdvancedTrackerEditor' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  codingSubCategoryRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    paddingVertical: 12,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1,
  },
  codingSubCategoryRowTitle: {
    fontSize: 16,
    color: '#35383D',
    marginBottom: 6,
    paddingTop: 6,
    lineHeight: 19.2,
  },
  codingSubCategoryRowRadioCircle: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codingSubCategoryRowRadioDot: {
    width: '65%',
    height: '65%',
    borderRadius: 12,
  },
  codingSubCategoryRowContentContainer: {
    paddingHorizontal: 35,
    paddingVertical: 12,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1,
    backgroundColor: '#F2F2F2',
  },
  codingSubCategoryRowContentText: {
    fontSize: 14,
    color: '#35383D',
    lineHeight: 21,
  },
  codingSubCategoryRowContentLinkContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  codingSubCategoryRowContentLink: {
    fontSize: 16,
    color: '#02BFF1',
    lineHeight: 19.2,
  },
});
