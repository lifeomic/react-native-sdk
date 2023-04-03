import React, { FC } from 'react';
import { View } from 'react-native';
import { SelectorRow, SelectorRowStyles } from './SelectorRow';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface SelectorRowData {
  id: string;
  title: string;
  selected?: boolean;
}

export interface SelectorViewProps {
  data: SelectorRowData[];
  disabled?: boolean;
  styles?: SelectorViewStyles;
  testID?: string;
  onSelected: (id: string) => any;
}

export const SelectorView: FC<SelectorViewProps> = (props) => {
  const { data, disabled, onSelected, styles: instanceStyles } = props;

  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <View style={styles.list}>
      {data.map((item) => (
        <SelectorRow
          disabled={disabled}
          id={item.id}
          key={item.id}
          onSelected={onSelected}
          selected={item.selected}
          styles={styles.selectorRow as SelectorRowStyles}
          title={item.title}
        />
      ))}
    </View>
  );
};

const defaultStyles = createStyles('SelectorView', () => ({
  list: {},
  selectorRow: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type SelectorViewStyles = NamedStylesProp<typeof defaultStyles>;
