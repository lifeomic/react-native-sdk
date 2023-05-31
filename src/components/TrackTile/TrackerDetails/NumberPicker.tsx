import { Modal, Platform, View, TouchableOpacity } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { t } from '../../../../lib/i18n';
import { tID } from '../common/testID';
import {
  createStyles,
  useIcons,
} from '../../../components/BrandConfigProvider';
import { Button, Text } from 'react-native-paper';
import { UnitType } from '../services/TrackTileService';
import { useStyles } from '../../../hooks';
import range from 'lodash/range';

export type NumberPickerProps = {
  onChange: (value: string) => void;
  selectedUnit: UnitType;
  placeholder?: string;
  value?: string;
  chevronColor: string;
};

export const NumberPicker = (props: NumberPickerProps) => {
  const {
    value = '0',
    selectedUnit,
    onChange,
    chevronColor,
    placeholder = t('track-tile.set-your-target', 'Set Your Target'),
  } = props;
  const { styles } = useStyles(defaultStyles);
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const { ChevronDown } = useIcons();

  const openInput = useCallback(() => {
    setIsOpen(true);
    setTempValue(value);
  }, [value]);

  const commitNewValue = useCallback(() => {
    setIsOpen(false);
    onChange(tempValue);
  }, [onChange, tempValue]);

  const stepAmount =
    selectedUnit.targetStepAmount ?? selectedUnit.stepAmount ?? 1;
  const minValue = selectedUnit.targetMin ?? 0;
  const maxValue = selectedUnit.targetStepAmount ?? stepAmount * 50;

  const numbers = useMemo(
    () => range(minValue, maxValue, stepAmount),
    [maxValue, minValue, stepAmount],
  );

  if (Platform.OS === 'android') {
    return (
      <View style={styles.androidContainer}>
        <Picker
          testID={tID('android-number-picker')}
          accessibilityRole="combobox"
          mode="dropdown"
          placeholder={placeholder}
          selectedValue={tempValue}
          onBlur={commitNewValue}
          onValueChange={(val) => {
            setTempValue(val as string);
          }}
          style={styles.androidPicker}
        >
          {numbers.map((n) => (
            <Picker.Item
              testID={tID(`number-picker-option-${n}`)}
              key={n}
              value={n.toString()}
              label={n.toString()}
            />
          ))}
        </Picker>
      </View>
    );
  }

  return (
    <>
      <Button
        onPress={openInput}
        accessibilityLabel={t('track-tile.number-picker', 'Number Picker')}
        accessibilityRole="menu"
        testID={tID('open-number-picker-button')}
        mode="outlined"
        style={styles.iosOpenPickerButton}
      >
        <Text style={styles.iosPlaceholderLabel}>{placeholder}</Text>
        <View style={{ paddingLeft: 100 }}>
          <ChevronDown color={chevronColor} />
        </View>
      </Button>
      <Modal visible={isOpen} transparent animationType="slide">
        <View style={styles.iosModalContentContainer}>
          <View style={styles.iosModalDoneButtonContainer}>
            <TouchableOpacity
              testID={tID('confirm-unit-selection-button')}
              onPress={commitNewValue}
            >
              <Text style={styles.numberPickerPopupAccessoryDoneTextIOS}>
                {t('track-tile-done', 'Done')}
              </Text>
            </TouchableOpacity>
          </View>
          <Picker
            testID={tID('number-picker')}
            accessibilityRole="combobox"
            selectedValue={tempValue}
            onValueChange={(val) => {
              setTempValue(val as string);
            }}
          >
            {numbers.map((n) => (
              <Picker.Item
                testID={tID(`number-picker-option-${n}`)}
                key={n}
                value={n.toString()}
                label={n.toString()}
              />
            ))}
          </Picker>
        </View>
      </Modal>
    </>
  );
};

const defaultStyles = createStyles('TrackTileNumberPicker', (theme) => ({
  androidContainer: {
    width: '75%',
    height: 40,
    borderWidth: 1,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.elevation.level1,
  },
  androidPicker: {
    height: '100%',
    width: '100%',
  },
  iosOpenPickerButton: {
    marginTop: 16,
    height: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 1,
    backgroundColor: theme.colors.background,
  },
  iosPlaceholderLabel: {
    color: '#262C32',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
  },
  iosModalContentContainer: {
    marginTop: 'auto',
    height: 215,
    justifyContent: 'center',
    backgroundColor: '#D0D4DA',
  },
  iosModalDoneButtonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#DEDEDE',
    zIndex: 2,
  },
  numberPickerPopupAccessoryDoneTextIOS: {
    color: '#007AFF',
    fontSize: 17,
    paddingTop: 1,
    paddingRight: 11,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackTileNumberPicker = NamedStylesProp<typeof defaultStyles>;
