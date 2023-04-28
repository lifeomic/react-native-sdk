import React, { useCallback, useEffect, useState } from 'react';
import { DevSettings } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { createStyles } from './BrandConfigProvider';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { View } from 'react-native';
import { emitEnvironmentToggled, useStyles } from '../hooks';

/*
    Debug menu for selecting a secondary environment during runtime.
    See AppDemo.tsx for implementation.
*/

export function EnvironmentSelection() {
  const [storedEnvironment, setStoredEnvironment] =
    useAsyncStorage('environment-toggle');
  const [selectedButton, setSelectedButton] = useState('primary');
  const { styles } = useStyles(defaultStyles);

  const selectEnvironment = useCallback(
    (value: string) => {
      setStoredEnvironment(value);
      setSelectedButton(value);
      DevSettings.reload();
    },
    [setStoredEnvironment],
  );

  // Populate selection from storage
  useEffect(() => {
    if (storedEnvironment.data) {
      setSelectedButton(storedEnvironment.data);
    }
  }, [storedEnvironment.data]);

  // Communicate updated selection to listener
  // in useEnvironmentSelection hook
  useEffect(() => {
    emitEnvironmentToggled(selectedButton);
  }, [selectedButton]);

  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text>Select environment</Text>
      <SegmentedButtons
        value={selectedButton}
        onValueChange={(value: string) => selectEnvironment(value)}
        buttons={[
          {
            value: 'primary',
            label: 'Primary',
            disabled: selectedButton === 'primary',
          },
          {
            value: 'secondary',
            label: 'Secondary',
            disabled: selectedButton === 'secondary',
          },
        ]}
      />
    </View>
  );
}

const defaultStyles = createStyles('EnvironmentSelection', () => ({
  container: {
    width: '70%',
    alignItems: 'center',
    position: 'absolute',
    bottom: '10%',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type EnvironmentSelectionStyles = NamedStylesProp<typeof defaultStyles>;
