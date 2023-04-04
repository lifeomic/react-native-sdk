import React, { FC } from 'react';
import { Text, View } from 'react-native';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface WearableRowHeaderProps {
  testID: string;
  title: string;
  icon?: React.ReactNode;
  styles?: WearableRowDetailHeaderStyles;
}

export const WearableRowHeader: FC<WearableRowHeaderProps> = (props) => {
  const { testID, title, icon, styles: instanceStyles } = props;
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <View testID={testID} style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <View testID={`${testID}-header-label`} style={styles.textWrapper}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    </View>
  );
};

const defaultStyles = createStyles('WearableRowDetailHeader', () => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  iconWrapper: {
    width: 34,
    marginStart: -5,
  },
  textWrapper: {
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type WearableRowDetailHeaderStyles = NamedStylesProp<
  typeof defaultStyles
>;
