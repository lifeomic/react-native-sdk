import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useFontOverrides } from '../../../styles';
import { t } from '../../../../../../lib/i18n';
import { Tracker } from '../../../services/TrackTileService';
import { createStyles } from '../../../../BrandConfigProvider';
import { useStyles } from '../../../../../hooks';

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
  const { styles } = useStyles(defaultStyles);
  const fontWeights = useFontOverrides();

  if (resourceType === 'Observation') {
    return (
      <>
        <Text style={[fontWeights.bold, styles.valueText]}>{value}</Text>
        <Text style={[fontWeights.bold, styles.unitText]}>
          {observationUnit}
        </Text>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onSelectUnitType('hour')}
        style={styles.procedureTimePartContainer}
      >
        <Text style={[fontWeights.bold, styles.valueText]}>
          {`${Math.floor(value / (60 * 60))
            .toString()
            .padStart(2, '0')}`}
        </Text>
        <Text
          style={[
            fontWeights.light,
            styles.procedureUnitText,
            editUnitType === 'hour' && styles.procedureUnitSelectedText,
          ]}
        >
          {t('track-tile.time-value-hours', 'hrs')}
        </Text>
      </TouchableOpacity>
      <Text style={[fontWeights.bold, styles.valueText]}>
        {t('track-tile.time-value-separator', ':')}
      </Text>
      <TouchableOpacity
        onPress={() => onSelectUnitType('min')}
        style={styles.procedureTimePartContainer}
      >
        <Text style={[fontWeights.bold, styles.valueText]}>
          {`${((value / 60) % 60).toString().padStart(2, '0')}`}
        </Text>
        <Text
          style={[
            fontWeights.light,
            styles.procedureUnitText,
            editUnitType === 'min' && styles.procedureUnitSelectedText,
          ]}
        >
          {t('track-tile.time-value-minutes', 'min')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const defaultStyles = createStyles('AdvancedTrackerEditorValueDisplay', () => ({
  container: {
    flexDirection: 'row',
  },
  valueText: {
    fontSize: 34,
    lineHeight: 40.8,
    color: '#35383D',
  },
  unitText: {
    fontSize: 12,
    lineHeight: 14.4,
    color: '#35383D',
    textTransform: 'uppercase',
  },
  procedureUnitText: {
    fontSize: 14,
    lineHeight: 21,
    textTransform: 'uppercase',
  },
  procedureTimePartContainer: {
    alignItems: 'center',
  },
  procedureUnitSelectedText: {
    height: 3,
    backgroundColor: '#C8CCD0',
    width: '100%',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
