import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import {
  StylesProp,
  useFontOverrides,
  useStyleOverrides,
} from '../../../styles';
import { t } from '../../../../../../lib/i18n';
import { Tracker } from '../../../services/TrackTileService';

type ValueDisplayProps = {
  resourceType: Tracker['resourceType'];
  /** @description this should be represented in the stored unit type. For Procedure resources that is always seconds */
  value: number;
  observationUnit: string;
  onSelectUnitType: (type: 'min' | 'hour') => void;
  editUnitType: string;
};

export const ValueDisplay = (props: ValueDisplayProps) => {
  const {
    resourceType,
    value,
    observationUnit,
    onSelectUnitType,
    editUnitType,
  } = props;
  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();

  if (resourceType === 'Observation') {
    return (
      <>
        <Text style={[fontWeights.bold, styles.advancedEditorTrackerValue]}>
          {value}
        </Text>
        <Text style={[fontWeights.bold, styles.advancedEditorTrackerUnit]}>
          {observationUnit}
        </Text>
      </>
    );
  }

  return (
    <View style={styles.advancedEditorTrackerValueContainer}>
      <TouchableOpacity
        onPress={() => onSelectUnitType('hour')}
        style={styles.advancedEditorProcedureTimePartContainer}
      >
        <Text style={[fontWeights.bold, styles.advancedEditorTrackerValue]}>
          {`${Math.floor(value / (60 * 60))
            .toString()
            .padStart(2, '0')}`}
        </Text>
        <Text
          style={[
            fontWeights.light,
            styles.advancedEditorProcedureUnit,
            editUnitType === 'hour' &&
              styles.advancedEditorProcedureUnitSelected,
          ]}
        >
          {t('track-tile.time-value-hours', 'hrs')}
        </Text>
      </TouchableOpacity>
      <Text style={[fontWeights.bold, styles.advancedEditorTrackerValue]}>
        {t('track-tile.time-value-separator', ':')}
      </Text>
      <TouchableOpacity
        onPress={() => onSelectUnitType('min')}
        style={styles.advancedEditorProcedureTimePartContainer}
      >
        <Text style={[fontWeights.bold, styles.advancedEditorTrackerValue]}>
          {`${((value / 60) % 60).toString().padStart(2, '0')}`}
        </Text>
        <Text
          style={[
            fontWeights.light,
            styles.advancedEditorProcedureUnit,
            editUnitType === 'min' &&
              styles.advancedEditorProcedureUnitSelected,
          ]}
        >
          {t('track-tile.time-value-minutes', 'min')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

declare module '../AdvancedTrackerEditor' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  advancedEditorTrackerValueContainer: {
    flexDirection: 'row',
  },
  advancedEditorTrackerValue: {
    fontSize: 34,
    lineHeight: 40.8,
    color: '#35383D',
  },
  advancedEditorTrackerUnit: {
    fontSize: 12,
    lineHeight: 14.4,
    color: '#35383D',
    textTransform: 'uppercase',
  },
  advancedEditorProcedureUnit: {
    fontSize: 14,
    lineHeight: 21,
    textTransform: 'uppercase',
  },
  advancedEditorProcedureTimePartContainer: {
    alignItems: 'center',
  },
  advancedEditorProcedureUnitSelected: {
    height: 3,
    backgroundColor: '#C8CCD0',
    width: '100%',
  },
});
