import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useUser } from '../hooks/useUser';
import { tID } from '../common/testID';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';

const getLabelValueSection = (label: string, value?: string) => {
  return typeof value === 'string' && value.length ? (
    <View testID={tID(label)}>
      <Text>
        {t('profile-label-value', '{{label}}: {{value}}', {
          label,
          value,
        })}
      </Text>
    </View>
  ) : null;
};

export const ProfileScreen = () => {
  const { isLoading, data } = useUser();

  const userProfile = data?.profile;

  if (isLoading) {
    return (
      <ActivityIndicatorView
        message={t('profile-loading-user', 'Loading user profile')}
      />
    );
  }

  if (!userProfile) {
    return (
      <ActivityIndicatorView
        message={t('profile-awaiting-user-data', 'Waiting on user data')}
      />
    );
  }

  return (
    <View>
      <ScrollView>
        {getLabelValueSection(t('profile-username', 'Username'), data.id)}
        {getLabelValueSection(
          t('profile-first-name', 'First Name'),
          userProfile.givenName,
        )}
        {getLabelValueSection(
          t('profile-last-name', 'Last Name'),
          userProfile.familyName,
        )}
        {getLabelValueSection(t('profile-email', 'Email'), userProfile.email)}
      </ScrollView>
    </View>
  );
};
