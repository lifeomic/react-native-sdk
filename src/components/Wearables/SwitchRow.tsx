import React, { FC } from 'react';
import { Text, Switch, View, SwitchProps } from 'react-native';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface SwitchRowProps extends SwitchProps {
  title: string;
  styles?: SwitchRowStyles;
}

export const SwitchRow: FC<SwitchRowProps> = (props) => {
  const { testID, title, accessibilityLabel, styles: instanceStyles } = props;
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <View testID={testID} style={styles.container}>
      <View testID={`${testID}-switch-label`} style={styles.textWrapper}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <Switch
        {...props}
        testID={`${testID}-switch`}
        accessibilityLabel={accessibilityLabel || `${title} app switch`}
      />
    </View>
  );
};

const defaultStyles = createStyles('SwitchRow', () => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  textWrapper: {
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type SwitchRowStyles = NamedStylesProp<typeof defaultStyles>;
