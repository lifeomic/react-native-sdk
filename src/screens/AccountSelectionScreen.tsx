import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { tID } from '../common/testID';
import { Account } from '../hooks/useAccounts';

export const AccountSelectionScreen = () => {
  const { accountsWithProduct, setActiveAccountId } = useActiveAccount();
  const { canGoBack, goBack } = useNavigation();

  const selectAccount = useCallback(
    (selectedAccount: Account) => async () => {
      await setActiveAccountId(selectedAccount.id);
      if (canGoBack()) {
        goBack();
      }
    },
    [setActiveAccountId, canGoBack, goBack],
  );

  return (
    <View testID={tID('acounts-screen-container')} style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.accountsWrapper}>
          {accountsWithProduct?.map((account) => (
            <TouchableOpacity
              style={styles.accountButton}
              onPress={selectAccount(account)}
              key={account.id}
              testID={tID(`select-account-${account.id}`)}
              accessibilityRole="button"
            >
              <Text>{account.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  scroll: {
    flex: 1,
  },
  accountsWrapper: {
    marginTop: 28,
    paddingHorizontal: 28,
  },
  accountButton: {
    marginBottom: 28,
  },
});
