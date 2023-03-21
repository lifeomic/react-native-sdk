import React, { FC, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { StylesProp, useStyleOverrides, Text, fontWeights } from '../styles';
import i18n from '@i18n';
import { tID } from '../common/testID';
import { coerceToNonnegativeValue } from './coerce-to-nonnegative-value';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import { convertToISONumber } from '../util/convert-value';
import { numberFormatters } from '../formatters';

type Props = {
  color: string;
  value: number;
  onChange: (value: number) => void;
};
const { numberFormat } = numberFormatters;
const TrackAmountControl: FC<Props> = ({ color, value, onChange }) => {
  const styles = useStyleOverrides(defaultStyles);
  const fonts = useFlattenedStyles(styles, [
    'trackAmountControlValueFontSizeLarge',
    'trackAmountControlValueFontSizeMedium',
    'trackAmountControlValueFontSizeSmall'
  ]);

  const [currentValue, setCurrentValue] = useState(numberFormat(value));

  useEffect(() => setCurrentValue(numberFormat(value)), [value]);

  const submitChange = useCallback(() => {
    const newValue = coerceToNonnegativeValue(
      convertToISONumber(currentValue),
      value
    );
    onChange(newValue);
    setCurrentValue(numberFormat(newValue));
  }, [currentValue, value]);

  let { fontSize } = fonts.trackAmountControlValueFontSizeLarge;

  if (value.toString().length === 5) {
    ({ fontSize } = fonts.trackAmountControlValueFontSizeMedium);
  } else if (value.toString().length > 5) {
    ({ fontSize } = fonts.trackAmountControlValueFontSizeSmall);
  }

  return (
    <View style={styles.trackAmountControlContainer}>
      <TouchableOpacity
        testID={tID('decrement-tracker-value-button')}
        accessibilityLabel={i18n.t('a420e9269fa8475365b5aba2596b2dc6', {
          defaultValue: 'Decrement tracker value',
          ns: 'track-tile-ui'
        })}
        accessibilityRole="button"
        onPress={() => value > 0 && onChange(value - 1)}
        hitSlop={{ left: 18, right: 18, top: 18, bottom: 18 }}
      >
        <Text variant="light" style={styles.trackAmountControlUnaryButton}>
          {i18n.t('336d5ebc5436534e61d16e63ddfca327', {
            defaultValue: '-',
            ns: 'track-tile-ui'
          })}
        </Text>
      </TouchableOpacity>
      <TextInput
        testID={tID('current-tracker-value')}
        accessibilityLabel={i18n.t('c606756e12cb4d462eb815d1641016b9', {
          defaultValue: 'Tracker value, {{value}}',
          value,
          ns: 'track-tile-ui'
        })}
        style={[
          { color },
          styles.trackAmountControlValue,
          fontWeights.bold,
          { fontSize }
        ]}
        keyboardType="numeric"
        value={currentValue}
        returnKeyType="done"
        selectTextOnFocus
        onBlur={submitChange}
        onSubmitEditing={submitChange}
        onChangeText={setCurrentValue}
      />
      <TouchableOpacity
        testID={tID('increment-tracker-value-button')}
        accessibilityLabel={i18n.t('f6d128902f6eaacb070c610c0556fbcd', {
          defaultValue: 'Increment tracker value',
          ns: 'track-tile-ui'
        })}
        accessibilityRole="button"
        onPress={() => onChange(value + 1)}
        hitSlop={{ left: 18, right: 18, top: 18, bottom: 18 }}
      >
        <Text variant="light" style={styles.trackAmountControlUnaryButton}>
          {i18n.t('26b17225b626fb9238849fd60eabdf60', {
            defaultValue: '+',
            ns: 'track-tile-ui'
          })}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

declare module './TrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  trackAmountControlContainer: {
    marginTop: -37.5,
    borderRadius: 50,
    width: '55%',
    maxWidth: 220,
    borderColor: '#D4DCE3',
    borderWidth: 1,
    height: 75,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { height: 4, width: 0 },
    shadowRadius: 34,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24
  },
  trackAmountControlUnaryButton: {
    color: 'black',
    textAlign: 'center',
    fontSize: 34,
    letterSpacing: 0.23,
    minWidth: 22,
    height: 44
  },
  trackAmountControlValue: {
    flex: 1,
    textAlign: 'center'
  },
  trackAmountControlValueFontSizeLarge: {
    fontSize: 40
  },
  trackAmountControlValueFontSizeMedium: {
    fontSize: 35
  },
  trackAmountControlValueFontSizeSmall: {
    fontSize: 26
  }
});

export default TrackAmountControl;
