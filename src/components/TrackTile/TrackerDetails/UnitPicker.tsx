import { Modal, Platform, View, TouchableOpacity } from 'react-native';
import { Text } from '../styles';
import React, { FC, useCallback, useState } from 'react';
import { Picker, PickerIOS } from '@react-native-picker/picker';
import { t } from '../../../../lib/i18n';
import { MetricType } from '../services/TrackTileService';
import { IosPickerIcon } from './IosPickerIcon';
import { tID } from '../common/testID';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

export type UnitPickerProps = {
  placeholder?: string;
  value: string;
  units: MetricType['units'];
  onChange: (value: string) => void;
};

export const UnitPicker: FC<UnitPickerProps> = (props) => {
  const {
    value,
    units,
    onChange,
    placeholder = t('track-tile.choose-a-unit', 'Choose a Unit'),
  } = props;
  const { styles } = useStyles(defaultStyles);
  const [width, setWidth] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const openInput = useCallback(() => {
    setIsOpen(true);
    setTempValue(value);
  }, [value]);

  const commitNewValue = useCallback(() => {
    setIsOpen(false);
    onChange(tempValue);
  }, [onChange, tempValue]);

  if (Platform.OS === 'ios') {
    return (
      <View>
        <TouchableOpacity
          onPress={openInput}
          accessibilityLabel={t('track-tile.unit-type', 'Unit type')}
          accessibilityRole="menu"
          testID={tID('open-unit-picker-button')}
        >
          <View style={styles.container}>
            <Text variant="semibold" style={styles.label}>
              {units.find((u) => u.unit === value)?.display}
            </Text>
            <View style={styles.iosIcon}>
              <IosPickerIcon />
            </View>
          </View>
        </TouchableOpacity>
        <Modal visible={isOpen} transparent animationType="slide">
          <View style={styles.iosPopupContainer}>
            <View style={styles.iosAccessoryContainer}>
              <TouchableOpacity
                testID={tID('confirm-unit-selection-button')}
                onPress={commitNewValue}
              >
                <Text
                  variant="semibold"
                  style={styles.iosPopupAccessoryDoneText}
                >
                  {t('track-tile-done', 'Done')}
                </Text>
              </TouchableOpacity>
            </View>
            <PickerIOS
              accessibilityRole="combobox"
              selectedValue={tempValue}
              onValueChange={(val) => setTempValue(val as string)}
            >
              {units.map(({ unit, display }) => (
                <PickerIOS.Item
                  testID={tID(`unit-picker-option-${unit}`)}
                  key={unit}
                  value={unit}
                  label={display.toLowerCase()}
                />
              ))}
            </PickerIOS>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        accessible={false}
        variant="semibold"
        numberOfLines={1}
        style={[{ marginRight: -width }, styles.label]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {units.find((u) => u.unit === value)?.display}
      </Text>
      <Picker
        testID={tID('open-unit-picker-button')}
        accessibilityRole="combobox"
        selectedValue={value}
        prompt={placeholder}
        onValueChange={onChange}
        style={Platform.select({
          android: [
            {
              width:
                width +
                Number(styles.androidLabel?.paddingLeft ?? 0) +
                Number(styles.androidLabel?.paddingRight ?? 0),
            },
            styles.androidLabel,
          ],
        })}
      >
        {units.map(({ unit, display }) => (
          <Picker.Item
            testID={tID(`unit-picker-option-${unit}`)}
            key={unit}
            value={unit}
            label={display.toLowerCase()}
            color={
              (unit === value
                ? styles.androidSelectedColorText?.color
                : styles.androidUnselectedColorText?.color) as string
            }
          />
        ))}
      </Picker>
    </View>
  );
};

const defaultStyles = createStyles('UnitPicker', () => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    letterSpacing: 0.23,
    color: '#262C32',
    fontSize: 16,
    lineHeight: 18,
    justifyContent: 'flex-end',
  },
  iosIcon: {
    marginLeft: 4,
    height: 7,
    width: 7,
    transform: [
      {
        translateY: -8,
      },
    ],
  },
  iosPopupContainer: {
    marginTop: 'auto',
    height: 215,
    justifyContent: 'center',
    backgroundColor: '#D0D4DA',
  },
  iosAccessoryContainer: {
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
  iosPopupAccessoryDoneText: {
    color: '#007AFF',
    fontSize: 17,
    paddingTop: 1,
    paddingRight: 11,
  },
  androidLabel: {
    color: 'transparent',
    height: 16,
    paddingRight: 28,
    paddingLeft: 5,
    marginRight: -15,
  },
  androidSelectedColorText: {
    color: '#30D4FF',
  },
  androidUnselectedColorText: {
    color: undefined,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
