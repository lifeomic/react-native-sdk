import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StylesProp, useFontOverrides, useStyleOverrides } from '../../styles';
import { Code } from '../../services/TrackTileService';
import { isCodeEqual } from '../../util/is-code-equal';
import { tID } from '../../common/testID';

export type CodingCategoryPickerProps<T extends Code> = {
  codes: T[];
  categoryHeader: string;
  selectedCode?: T;
  color: string;
  onCodePressed: (code?: T) => () => void;
};

export function CodingCategoryPicker<T extends Code>(
  props: CodingCategoryPickerProps<T>,
) {
  const { categoryHeader, codes, onCodePressed, color, selectedCode } = props;
  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();

  return (
    <View>
      <Text style={[fontWeights.bold, styles.codingCategoryPickerHeader]}>
        {categoryHeader}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.codingCategoryPickerBubbleContainer}
      >
        {codes.map((code) => (
          <TouchableOpacity key={code.id} onPress={onCodePressed(code)}>
            <Text
              testID={
                isCodeEqual(selectedCode, code)
                  ? tID(`selected-category-${code.id}`)
                  : undefined
              }
              style={[
                fontWeights.semibold,
                styles.codingCategoryPickerBubble,
                isCodeEqual(selectedCode, code) && [
                  styles.codingCategoryPickerBubbleSelected,
                  {
                    backgroundColor: color,
                    borderColor: color,
                  },
                ],
              ]}
            >
              {code.display}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

declare module './AdvancedTrackerEditor' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  codingCategoryPickerHeader: {
    fontSize: 34,
    lineHeight: 40.8,
    color: '#35383D',
  },
  codingCategoryPickerBubbleContainer: {
    overflow: 'visible',
    marginTop: 20,
  },
  codingCategoryPickerBubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    alignItems: 'center',
    height: 36,
    lineHeight: 20,
    borderRadius: 18,
    minWidth: 65,
    marginEnd: 8,
    borderColor: 'black',
    overflow: 'hidden',
  },
  codingCategoryPickerBubbleSelected: {
    color: 'white',
  },
});
