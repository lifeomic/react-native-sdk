import React, { FC, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import merge from 'lodash/merge';

import { Colors, Padding } from './defaultTheme';

export interface SelectorRowProps {
  disabled?: boolean;
  id: string;
  styles?: any;
  selected?: boolean;
  title: string;
  testID?: string;
  onSelected: (id: string) => any;
}

export const SelectorRow: FC<SelectorRowProps> = (props) => {
  const { disabled, id, onSelected, selected, title, testID } = props;

  const styles = merge({}, defaultStyles, props.styles);

  const _onSelected = useCallback(
    (id: string) => () => {
      onSelected(id);
    },
    []
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel={title}
        disabled={disabled}
        onPress={_onSelected(id)}
        testID={testID}
      >
        <View
          testID={`${testID}-label`}
          style={[
            styles.textWrapper,
            selected ? styles.selected : styles.unselected
          ]}
        >
          <Text
            testID={`${testID}-title`}
            style={[
              styles.choiceText,
              selected ? styles.selected : styles.unselected
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const SelectorRowDefaultStyles = {
  container: {
    minHeight: 40
  },
  choiceText: {
    textAlign: 'right'
  },
  textWrapper: {
    padding: Padding.medium
  },
  unselected: {
    backgroundColor: Colors.rowBackground
  },
  selected: {
    backgroundColor: Colors.activeRowBackground,
    fontWeight: '700'
  }
};
const defaultStyles = StyleSheet.create(SelectorRowDefaultStyles as any);
