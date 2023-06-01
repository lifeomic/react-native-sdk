import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { Tracker } from '../../../services/TrackTileService';
import { ValueDisplay } from './ValueDisplay';
import { tID } from '../../../common/testID';
import { createStyles, useIcons } from '../../../../BrandConfigProvider';
import { useStyles } from '../../../../../hooks';

export type ValueEditorProps = Pick<Tracker, 'resourceType' | 'color'> & {
  /** @description this should be represented in the stored unit type. For Procedure resources that is always seconds */
  stepAmount: number;
  value: number;
  onValueChange: (value: number) => void;
  observationUnit: string;
  style?: StyleProp<ViewStyle>;
};

const HOUR_IN_SECONDS = 60 * 60;

export const ValueEditor = (props: ValueEditorProps) => {
  const { observationUnit, style } = props;
  const { resourceType, onValueChange, value, stepAmount, color } = props;
  const { MinusCircle, PlusCircle } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const [editUnitType, setEditUnitType] = useState<'min' | 'hour'>('min');

  const modifyValue = useCallback(
    (dir: -1 | 1) => () => {
      const changeByAmount =
        dir * (editUnitType === 'hour' ? HOUR_IN_SECONDS : stepAmount);
      onValueChange(
        Math.round(Math.max(value + changeByAmount, 0) / changeByAmount) *
          changeByAmount,
      );
    },
    [onValueChange, value, stepAmount, editUnitType],
  );

  return (
    <View style={style}>
      <TouchableOpacity
        testID={tID('decrement-value')}
        onPress={modifyValue(-1)}
        style={styles.button}
      >
        <MinusCircle width="100%" height="100%" color={color} />
      </TouchableOpacity>
      <View style={styles.valueContainer}>
        <ValueDisplay
          value={value}
          resourceType={resourceType}
          onSelectUnitType={setEditUnitType}
          editUnitType={editUnitType}
          observationUnit={observationUnit}
        />
      </View>
      <TouchableOpacity
        testID={tID('increment-value')}
        onPress={modifyValue(1)}
        style={styles.button}
      >
        <PlusCircle width="100%" height="100%" color={color} />
      </TouchableOpacity>
    </View>
  );
};

const defaultStyles = createStyles('AdvancedTrackerValueEditor', () => ({
  button: {
    width: 30,
    height: 30,
  },
  valueContainer: {
    alignItems: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
