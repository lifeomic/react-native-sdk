import React, { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { tID } from '../common/testID';
import { Account } from '../types/rest-types';
import { SettingsStackScreenProps } from '../navigators/types';
import { createStyles } from '../components';
import { useStyles } from '../hooks';

export const AccountSelectionScreen = ({
  navigation,
}: SettingsStackScreenProps<'Settings/AccountSelection'>) => {
  const { styles } = useStyles(defaultStyles);
  const { accountsWithProduct, setActiveAccountId } = useActiveAccount();
  const selectAccount = useCallback(
    (selectedAccount: Account) => async () => {
      setActiveAccountId(selectedAccount.id);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    [setActiveAccountId, navigation],
  );

  return (
    <View testID={tID('acounts-screen-container')} style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          {accountsWithProduct?.map((account) => (
            <TouchableOpacity
              style={styles.button}
              onPress={selectAccount(account)}
              key={account.id}
              testID={tID(`select-account-${account.id}`)}
              accessibilityRole="button"
            >
              <Text style={styles.accountText}>{account.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const defaultStyles = createStyles('AccountSelection', () => ({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  scroll: {
    flex: 1,
  },
  content: {
    marginTop: 28,
    paddingHorizontal: 28,
  },
  button: {
    marginBottom: 28,
  },
  accountText: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
