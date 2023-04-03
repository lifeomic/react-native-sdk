import React, { FC, useCallback, useState } from 'react';
import { LayoutAnimation, Text, TouchableOpacity, View } from 'react-native';

import { WearableIntegration } from './WearableTypes';
import { SelectorView, SelectorViewStyles } from './SelectorView';
import Chevron from './icons/Chevron';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface SyncTypeSelectionRowProps {
  disabled?: boolean;
  onUpdate: (ehrId: string) => any;
  selectedEHRId: string;
  styles?: SyncTypeSelectionRowStyles;
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
    testID,
    styles: instanceStyles,
  } = props;

  const toggleSelecting = useCallback(() => {
    LayoutAnimation.easeInEaseOut();
    setSelecting((selected) => !selected);
  }, []);

  const _onUpdate = useCallback(
    (ehrId: string) => {
      LayoutAnimation.easeInEaseOut();
      setSelecting(false);
      onUpdate(ehrId);
    },
    [onUpdate],
  );

  const { styles } = useStyles(defaultStyles, instanceStyles);

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
            selected: w.ehrId === selectedEHRId,
          }))}
          disabled={disabled}
          onSelected={_onUpdate}
          styles={styles.selectorView as SelectorViewStyles}
        />
      )}
    </View>
  );
};

const defaultStyles = createStyles('SyncTypeSelectionRow', (theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  textWrapper: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
  },
  syncTypeLabel: {
    fontWeight: 'bold',
  },
  syncTypeValue: {
    flex: 1,
    textAlign: 'right',
    paddingEnd: 18,
  },
  selectorView: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type SyncTypeSelectionRowStyles = NamedStylesProp<typeof defaultStyles>;
