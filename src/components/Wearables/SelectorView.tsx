import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import merge from 'lodash/merge';
import { SelectorRow } from './SelectorRow';

export interface SelectorRowData {
  id: string;
  title: string;
  selected?: boolean;
}

export interface SelectorViewProps {
  data: SelectorRowData[];
  disabled?: boolean;
  styles?: any;
  testID?: string;
  onSelected: (id: string) => any;
}

export const SelectorView: FC<SelectorViewProps> = (props) => {
  const { data, disabled, onSelected } = props;

  const styles = merge({}, defaultStyles, props.styles);

  return (
    <View style={styles.list}>
      {data.map((item) => (
        <SelectorRow
          disabled={disabled}
          id={item.id}
          key={item.id}
          onSelected={onSelected}
          selected={item.selected}
          styles={styles.selectorRow}
          title={item.title}
        />
      ))}
    </View>
  );
};

export const SelectorViewDefaultStyles = {
  list: {}
};
const defaultStyles = StyleSheet.create(SelectorViewDefaultStyles as any);
