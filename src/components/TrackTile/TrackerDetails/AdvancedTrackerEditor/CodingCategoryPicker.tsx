import React from 'react';
import { TouchableOpacity, Text, View, ScrollView } from 'react-native';
import { useFontOverrides } from '../../styles';
import { Code } from '../../services/TrackTileService';
import { isCodeEqual } from '../../util/is-code-equal';
import { tID } from '../../common/testID';
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

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
  const { styles } = useStyles(defaultStyles);
  const fontWeights = useFontOverrides();

  return (
    <View>
      <Text style={[fontWeights.bold, styles.headerText]}>
        {categoryHeader}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bubbleContainer}
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
                styles.bubble,
                isCodeEqual(selectedCode, code) && [
                  {
                    backgroundColor: color,
                    borderColor: color,
                  },
                  styles.bubbleSelectedText,
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

const defaultStyles = createStyles('CodingCategoryPicker', () => ({
  headerText: {
    fontSize: 34,
    lineHeight: 40.8,
    color: '#35383D',
  },
  bubbleContainer: {
    overflow: 'visible',
    marginTop: 20,
  },
  bubble: {
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
  bubbleSelectedText: {
    color: 'white',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
