import {
  Modal,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Picker
} from 'react-native';
import { StylesProp, useStyleOverrides, Text } from '../styles';
import React, { FC, useCallback, useState } from 'react';
import { PickerIOS } from '@react-native-community/picker';
import i18n from '@i18n';
import { MetricType } from '../services/TrackTileService';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import { IosPickerIcon } from './IosPickerIcon';
import { tID } from '../common/testID';

declare module './TrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

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
    placeholder = i18n.t('9031f0b71c20458a79410b99b2e3d521', {
      defaultValue: 'Choose a Unit',
      ns: 'track-tile-ui'
    })
  } = props;
  const styles = useStyleOverrides(defaultStyles);
  const [width, setWidth] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const flatStyles = useFlattenedStyles(styles, [
    'unitPickerLabelAndroid',
    'unitPickerSelectedColorAndroid',
    'unitPickerUnselectedColorAndroid'
  ]);

  if (Platform.OS === 'ios') {
    const openInput = useCallback(() => {
      setIsOpen(true);
      setTempValue(value);
    }, [value]);

    const commitNewValue = useCallback(() => {
      setIsOpen(false);
      onChange(tempValue);
    }, [tempValue]);

    return (
      <View>
        <TouchableOpacity
          onPress={openInput}
          accessibilityLabel={i18n.t('ae96a9f2fdf142f2c5da6a70ab8bbce2', {
            defaultValue: 'Unit type',
            ns: 'track-tile-ui'
          })}
          accessibilityRole="menu"
          testID={tID('open-unit-picker-button')}
        >
          <View style={styles.unitPickerContainer}>
            <Text variant="semibold" style={styles.unitPickerLabel}>
              {units.find((u) => u.unit === value)?.display}
            </Text>
            <View style={styles.unitPickerIconIOS}>
              <IosPickerIcon />
            </View>
          </View>
        </TouchableOpacity>
        <Modal visible={isOpen} transparent animationType="slide">
          <View style={styles.unitPickerPopupContainerIOS}>
            <View style={styles.unitPickerPopupAccessoryContainerIOS}>
              <TouchableOpacity
                testID={tID('confirm-unit-selection-button')}
                onPress={commitNewValue}
              >
                <Text
                  variant="semibold"
                  style={styles.unitPickerPopupAccessoryDoneTextIOS}
                >
                  {i18n.t('f92965e2c8a7afb3c1b9a5c09a263636', {
                    defaultValue: 'Done',
                    ns: 'track-tile-ui'
                  })}
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
    <View style={styles.unitPickerContainer}>
      <Text
        accessible={false}
        variant="semibold"
        numberOfLines={1}
        style={[{ marginRight: -width }, styles.unitPickerLabel]}
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
                flatStyles.unitPickerLabelAndroid.paddingLeft +
                flatStyles.unitPickerLabelAndroid.paddingRight
            },
            styles.unitPickerLabelAndroid
          ]
        })}
      >
        {units.map(({ unit, display }) => (
          <Picker.Item
            testID={tID(`unit-picker-option-${unit}`)}
            key={unit}
            value={unit}
            label={display.toLowerCase()}
            color={
              unit === value
                ? flatStyles.unitPickerSelectedColorAndroid.color
                : flatStyles.unitPickerUnselectedColorAndroid.color
            }
          />
        ))}
      </Picker>
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  unitPickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  unitPickerLabel: {
    letterSpacing: 0.23,
    color: '#262C32',
    fontSize: 16,
    lineHeight: 18,
    justifyContent: 'flex-end'
  },
  unitPickerIconIOS: {
    marginLeft: 4,
    height: 7,
    width: 7,
    transform: [
      {
        translateY: -8
      }
    ]
  },
  unitPickerPopupContainerIOS: {
    marginTop: 'auto',
    height: 215,
    justifyContent: 'center',
    backgroundColor: '#D0D4DA'
  },
  unitPickerPopupAccessoryContainerIOS: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#DEDEDE',
    zIndex: 2
  },
  unitPickerPopupAccessoryDoneTextIOS: {
    color: '#007AFF',
    fontSize: 17,
    paddingTop: 1,
    paddingRight: 11
  },
  unitPickerLabelAndroid: {
    color: 'transparent',
    height: 16,
    paddingRight: 28,
    paddingLeft: 5,
    marginRight: -15
  },
  unitPickerSelectedColorAndroid: {
    color: '#30D4FF'
  },
  unitPickerUnselectedColorAndroid: {
    color: undefined
  }
});
