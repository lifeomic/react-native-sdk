import React, { FC } from 'react';
import { t } from '../../../lib/i18n';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { tID } from './common/testID';
import { createStyles, useIcons } from '../BrandConfigProvider';
import { useStyles } from '../../hooks';

const OpenSettingsButton: FC<TouchableOpacityProps> = (props) => {
  const { Settings } = useIcons();
  const { styles } = useStyles(defaultStyles);

  return (
    <TouchableOpacity
      testID={tID('open-tracker-settings-button')}
      accessibilityRole="button"
      accessibilityLabel={t(
        'track-tile.open-tracker-settings',
        'Open Tracker Settings',
      )}
      style={styles.container}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...props}
    >
      <Settings stroke={styles.iconImage?.overlayColor} />
    </TouchableOpacity>
  );
};

const defaultStyles = createStyles('TrackTileSettingsButton', () => ({
  container: { width: 24, height: 24 },
  iconImage: { overlayColor: '#02BFF1' },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default OpenSettingsButton;
