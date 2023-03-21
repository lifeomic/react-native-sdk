import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import {
  StylesProp,
  useFontOverrides,
  useStyleOverrides
} from '../../../styles';
import i18n from '@i18n';
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
    editUnitType
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
              styles.advancedEditorProcedureUnitSelected
          ]}
        >
          {i18n.t('time-value-hours', {
            defaultValue: 'hrs',
            ns: 'track-tile-ui'
          })}
        </Text>
      </TouchableOpacity>
      <Text style={[fontWeights.bold, styles.advancedEditorTrackerValue]}>
        {i18n.t('time-value-separator', {
          defaultValue: ':',
          ns: 'track-tile-ui'
        })}
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
            editUnitType === 'min' && styles.advancedEditorProcedureUnitSelected
          ]}
        >
          {i18n.t('time-value-minutes', {
            defaultValue: 'min',
            ns: 'track-tile-ui'
          })}
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
    flexDirection: 'row'
  },
  advancedEditorTrackerValue: {
    fontSize: 34,
    lineHeight: 40.8,
    color: '#35383D'
  },
  advancedEditorTrackerUnit: {
    fontSize: 12,
    lineHeight: 14.4,
    color: '#35383D',
    textTransform: 'uppercase'
  },
  advancedEditorProcedureUnit: {
    fontSize: 14,
    lineHeight: 21,
    textTransform: 'uppercase'
  },
  advancedEditorProcedureTimePartContainer: {
    alignItems: 'center'
  },
  advancedEditorProcedureUnitSelected: {
    height: 3,
    backgroundColor: '#C8CCD0',
    width: '100%'
  }
});
