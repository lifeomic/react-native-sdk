import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { NoInternetToastProvider } from '../../../src';
import Toast from 'react-native-toast-message';
import { StyleSheet, Text, View } from 'react-native';
import { CenterView } from '../helpers/CenterView';

const styles = StyleSheet.create({
  view: {
    marginTop: '5%',
    flexDirection: 'row',
    alignSelf: 'center',
    maxWidth: '85%',
  },
  text: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
});

storiesOf('NoInternetToast', module)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)
  .add('demo', () => {
    return (
      <View>
        <NoInternetToastProvider />
        <View style={styles.view}>
          <Text style={styles.text}>
            This component depends on the connection state of your device. The
            toast will be displayed when you disconnect from internet and hidden
            when you've restored your connection. The NetInfo library recommends
            that you do not use an iOS Simulator for testing this.{'\n\n'}
            <Text style={styles.textBold}>
              "There is a known issue with the iOS Simulator which causes it to
              not receive network change notifications correctly when the host
              machine disconnects and then connects to Wifi."
            </Text>
          </Text>
        </View>
        <Toast />
      </View>
    );
  });
