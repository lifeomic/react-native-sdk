import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { useOnboardingCourse } from '../hooks/useOnboardingCourse';
import {
  LoggedInRootParamList,
  LoggedInRootScreenProps,
} from '../navigators/types';
import { useNavigation } from '@react-navigation/native';
import { HeaderButton } from '../components/HeaderButton';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = LoggedInRootScreenProps<'screens/OnboardingCourseScreen'>;

export const DoneHeaderButton = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<
        LoggedInRootParamList,
        'screens/OnboardingCourseScreen'
      >
    >();

  return (
    <HeaderButton
      title="Done"
      onPress={() => {
        navigation.replace('app');
      }}
    />
  );
};

export const OnboardingCourseScreen = ({ navigation }: Props) => {
  const { onboardingCourseUrl, onOnboardingCourseOpen, onboardingCourseTitle } =
    useOnboardingCourse();

  useEffect(() => {
    onOnboardingCourseOpen();
  }, [onOnboardingCourseOpen]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: DoneHeaderButton,
      title: onboardingCourseTitle || ' ',
    });
  }, [navigation, onboardingCourseTitle]);

  if (!onboardingCourseUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: onboardingCourseUrl,
        }}
        testID="onboarding-course-web-view"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
  },
});
