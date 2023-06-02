import React, { FC, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../../hooks/useStyles';

export interface SelectorRowProps {
  disabled?: boolean;
  id: string;
  styles?: SelectorRowStyles;
  selected?: boolean;
  title: string;
  testID?: string;
  onSelected: (id: string) => any;
}

export const SelectorRow: FC<SelectorRowProps> = (props) => {
  const { disabled, id, onSelected, selected, title, testID } = props;
  const { styles } = useStyles(defaultStyles);

  const _onSelected = useCallback(
    (selectedId: string) => () => {
      onSelected(selectedId);
    },
    [onSelected],
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
            selected ? styles.selectedView : styles.unselectedView,
          ]}
        >
          <Text
            testID={`${testID}-title`}
            style={[
              styles.choiceText,
              selected ? styles.selectedView : styles.unselectedView,
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const defaultStyles = createStyles('SelectorRow', (theme) => ({
  container: {
    minHeight: 40,
  },
  choiceText: {
    textAlign: 'right',
  },
  textWrapper: {
    padding: theme.spacing.small,
  },
  unselectedView: {
    backgroundColor: theme.colors.surface,
  },
  selectedView: {
    backgroundColor: theme.colors.surface,
    fontWeight: '700',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type SelectorRowStyles = NamedStylesProp<typeof defaultStyles>;
