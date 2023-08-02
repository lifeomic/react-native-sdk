import React, { useEffect } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';
import { t } from '../../lib/i18n';
import { useStyles, useOnboardingCourse } from '../hooks';
import {
  LoggedInRootParamList,
  LoggedInRootScreenProps,
} from '../navigators/types';
import { useNavigation } from '@react-navigation/native';
import { HeaderButton } from '../components/HeaderButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { createStyles } from '../components/BrandConfigProvider';

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
      title={t('onboarding-course.done', 'Done')}
      onPress={() => {
        navigation.replace('app');
      }}
    />
  );
};

export const OnboardingCourseScreen = ({ navigation }: Props) => {
  const { styles } = useStyles(defaultStyles);
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

const defaultStyles = createStyles('OnboardingCourseScreen', () => ({
  container: {
    flex: 1,
    margin: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type OnboardingCourseScreenStyles = NamedStylesProp<
  typeof defaultStyles
>;
