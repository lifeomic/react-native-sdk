import React, { FC, useCallback, useState } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import merge from 'lodash/merge';

import { Colors, Margin, Padding } from './defaultTheme';
import { WearableIntegration } from '@lifeomic/wearables-sync';
import { SelectorView } from './SelectorView';
import Chevron from './icons/Chevron';

export interface SyncTypeSelectionRowProps {
  disabled?: boolean;
  onUpdate: (ehrId: string) => any;
  selectedEHRId: string;
  styles?: any;
  syncTypeTitle: string;
  syncTypeOptions: WearableIntegration[];
  testID?: string;
}

export const SyncTypeSelectionRow: FC<SyncTypeSelectionRowProps> = (props) => {
  const [selecting, setSelecting] = useState(false);
  const {
    disabled,
    onUpdate,
    syncTypeOptions,
    syncTypeTitle,
    selectedEHRId,
    testID
  } = props;

  const toggleSelecting = useCallback(() => {
    LayoutAnimation.easeInEaseOut();
    setSelecting(!selecting);
  }, []);

  const _onUpdate = useCallback(
    (ehrId: string) => {
      LayoutAnimation.easeInEaseOut();
      setSelecting(false);
      onUpdate(ehrId);
    },
    [onUpdate]
  );

  const styles = merge({}, defaultStyles, props.styles);

  const selection = syncTypeOptions.find((w) => w.ehrId === selectedEHRId);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel={syncTypeTitle}
        disabled={disabled}
        onPress={toggleSelecting}
        testID={testID}
      >
        <View style={styles.textWrapper}>
          <Text
            testID={`${testID}-sync-type-label`}
            style={styles.syncTypeLabel}
          >
            {syncTypeTitle}
          </Text>
          {!selecting && (
            <Text
              testID={`${testID}-sync-type-selection`}
              style={styles.syncTypeValue}
              accessibilityLabel={`${selection?.name} - ${syncTypeTitle}`}
            >
              {selection?.name}
            </Text>
          )}
          {!selecting && <Chevron />}
        </View>
      </TouchableOpacity>
      {selecting && (
        <SelectorView
          data={syncTypeOptions.map((w) => ({
            id: w.ehrId,
            title: w.name,
            selected: w.ehrId === selectedEHRId
          }))}
          disabled={disabled}
          onSelected={_onUpdate}
          styles={styles.selectorView}
        />
      )}
    </View>
  );
};

export const SyncTypeSelectionRowDefaultStyles = {
  container: {
    backgroundColor: Colors.rowBackground,
    marginHorizontal: Margin.standard,
    marginVertical: Margin.small / 2,
    borderRadius: 10,
    overflow: 'hidden'
  },
  textWrapper: {
    flexDirection: 'row',
    padding: Padding.medium,
    justifyContent: 'space-between'
  },
  syncTypeLabel: {
    fontWeight: 'bold'
  },
  syncTypeValue: {
    flex: 1,
    textAlign: 'right',
    paddingEnd: Padding.large
  }
};
const defaultStyles = StyleSheet.create(
  SyncTypeSelectionRowDefaultStyles as any
);
