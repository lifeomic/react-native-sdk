import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import useTimeout from 'react-use/lib/useTimeout';
import { tID } from '../common/testID';

interface Props {
  message: string;
  timeOutMilliseconds?: number;
}

export function ActivityIndicatorView({
  message: timeOutMessage,
  timeOutMilliseconds,
}: Props) {
  const [showMessage] = useTimeout(timeOutMilliseconds || 5000);

  return (
    <View style={styles.activityIndicatorContainer}>
      <ActivityIndicator
        size="large"
        animating
        testID={tID('activity-indicator-view')}
      />
      {showMessage() && (
        <Text style={styles.activityIndicatorText}>{timeOutMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicatorText: {
    margin: 16,
  },
});
