import React, { FC, useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text, fontWeights } from '../styles';
import { t } from '../../../../lib/i18n';
import { tID } from '../common/testID';
import { coerceToNonnegativeValue } from './coerce-to-nonnegative-value';
import { convertToISONumber } from '../util/convert-value';
import { numberFormatters } from '../formatters';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

type Props = {
  color: string;
  value: number;
  onChange: (value: number) => void;
  saveInProgress: boolean;
  styles?: TrackAmountControlStyles;
};
const { numberFormat } = numberFormatters;
const TrackAmountControl: FC<Props> = (props) => {
  const { color, value, onChange, saveInProgress } = props;
  const { styles } = useStyles(defaultStyles, props.styles);

  const [currentValue, setCurrentValue] = useState(numberFormat(value));

  useEffect(() => {
    if (!saveInProgress) {
      setCurrentValue(numberFormat(value));
    }
  }, [value, saveInProgress]);

  const submitChange = useCallback(() => {
    const newValue = coerceToNonnegativeValue(
      convertToISONumber(currentValue),
      value,
    );
    onChange(newValue);
    setCurrentValue(numberFormat(newValue));
  }, [currentValue, onChange, value]);

  let { fontSize } = styles.valueLargeSizeText ?? {};

  if (value.toString().length === 5) {
    ({ fontSize } = styles.valueMediumSizeText ?? {});
  } else if (value.toString().length > 5) {
    ({ fontSize } = styles.valueSmallSizeText ?? {});
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID={tID('decrement-tracker-value-button')}
        accessibilityLabel={t(
          'track-tile.decrement-tracker-value',
          'Decrement tracker value',
        )}
        accessibilityRole="button"
        onPress={() => {
          const asString = addToNumberString(currentValue, -1, false) as string;
          const asNumber = addToNumberString(currentValue, -1, true) as number;
          if (asNumber > -1) {
            setCurrentValue(asString);
            onChange(asNumber);
          }
        }}
        hitSlop={{ left: 18, right: 18, top: 18, bottom: 18 }}
        style={styles.unaryButton}
      >
        <Text variant="light" style={styles.unaryButtonText}>
          {t('track-tile.dash-symbol', '-')}
        </Text>
      </TouchableOpacity>
      <View style={styles.valueInputContainer}>
        <TextInput
          testID={tID('current-tracker-value')}
          accessibilityLabel={t('track-tile.tracker-value-value', {
            defaultValue: 'Tracker value, {{value}}',
            value,
          })}
          style={[
            { color },
            styles.valueInputView,
            fontWeights.bold,
            { fontSize },
          ]}
          keyboardType="numeric"
          value={currentValue}
          returnKeyType="done"
          selectTextOnFocus
          onBlur={submitChange}
          onSubmitEditing={submitChange}
          onChangeText={setCurrentValue}
        />
      </View>
      <TouchableOpacity
        testID={tID('increment-tracker-value-button')}
        accessibilityLabel={t(
          'track-tile.increment-tracker-value',
          'Increment tracker value',
        )}
        accessibilityRole="button"
        onPress={() => {
          const asString = addToNumberString(currentValue, 1, false) as string;
          const asNumber = addToNumberString(currentValue, 1, true) as number;
          setCurrentValue(asString);
          onChange(asNumber);
        }}
        hitSlop={{ left: 18, right: 18, top: 18, bottom: 18 }}
        style={styles.unaryButton}
      >
        <Text variant="light" style={styles.unaryButtonText}>
          {t('track-tile.plus-symbol', '+')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const addToNumberString = (
  numberString: string,
  numberToAdd: number,
  returnNumber: boolean,
) => {
  const number = Number(convertToISONumber(numberString));
  const result = number + numberToAdd;
  return returnNumber ? result : numberFormat(result);
};

const defaultStyles = createStyles('TrackAmountControl', (theme) => ({
  container: {
    marginTop: 30,
    width: '80%',
    backgroundColor: theme.colors.elevation.level1,
    justifyContent: 'space-between',
    alignContent: 'center',
    flexDirection: 'row',
  },
  unaryButton: {
    backgroundColor: theme.colors.background,
    borderRadius: 32,
    height: 60,
    width: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unaryButtonText: {
    color: 'black',
    textAlign: 'center',
    textAlignVertical: 'center',
    aspectRatio: 1,
    fontSize: 30,
    fontWeight: 'bold',
  },
  valueInputContainer: {},
  valueInputView: {
    flex: 1,
    textAlign: 'center',
  },
  valueLargeSizeText: {
    fontSize: 40,
  },
  valueMediumSizeText: {
    fontSize: 35,
  },
  valueSmallSizeText: {
    fontSize: 26,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackAmountControlStyles = NamedStylesProp<typeof defaultStyles>;

export default TrackAmountControl;
