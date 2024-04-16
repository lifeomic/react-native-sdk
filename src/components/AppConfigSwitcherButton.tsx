import React from 'react';
import { IconButton } from 'react-native-paper';
import { useIcons } from './BrandConfigProvider/icons/IconProvider';
import { emitShowAppConfigSwitcher } from './AppConfigSwitcher';
import { createStyles } from './BrandConfigProvider/styles/createStyles';
import { useStyles } from '../hooks/useStyles';

const AppConfigSwitcherButton = () => {
  const { Menu } = useIcons();
  const { styles } = useStyles(defaultStyles);
  return (
    <IconButton
      onPress={emitShowAppConfigSwitcher}
      icon={Menu}
      style={styles.iconButton}
    />
  );
};

export default AppConfigSwitcherButton;

const defaultStyles = createStyles('AppConfigSwitcherButton', () => ({
  iconButton: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type AppConfigSwitcher = NamedStylesProp<typeof defaultStyles>;
