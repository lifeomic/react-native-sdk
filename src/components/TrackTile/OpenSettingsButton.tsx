import React, { FC } from 'react';
import { t } from '@i18n';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import Gear from './icons/Gear';
import { StylesProp, useStyleOverrides } from './styles';
import { tID } from './common/testID';

const OpenSettingsButton: FC<TouchableOpacityProps> = (props) => {
  const styles = useStyleOverrides(defaultStyles);

  return (
    <TouchableOpacity
      testID={tID('open-tracker-settings-button')}
      accessibilityRole="button"
      accessibilityLabel={t('track-tile.open-tracker-settings', {
        defaultValue: 'Open Tracker Settings',
        ns: 'track-tile-ui',
      })}
      style={styles.trackTileSettingsButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...props}
    >
      <Gear />
    </TouchableOpacity>
  );
};

declare module './TrackTile' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  trackTileSettingsButton: { width: 24, height: 24 },
});

export default OpenSettingsButton;
